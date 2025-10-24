import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, TextInput, ActivityIndicator, Platform, FlatList, TouchableWithoutFeedback, Image } from 'react-native';
import { Modal } from 'react-native';
import ProfileModal from './ProfileModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import styles from '../styles/Home';
import { format } from 'date-fns';

export default function HomeScreen({ navigation, route }) {
  const [location, setLocation] = useState({
    latitude: -34.9011,
    longitude: -56.1645,
  });
  const [deltas, setDeltas] = useState({ latitudeDelta: 2.5, longitudeDelta: 2.5 });
  const mapRef = useRef(null);
  const [address, setAddress] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [defaultCountryCode] = useState('uy');
  const [searchText, setSearchText] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarView, setCalendarView] = useState('days');
  const [yearPageStart, setYearPageStart] = useState(new Date().getFullYear() - 6);
  const monthsFull = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monthsShort = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const weekdaysShort = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

  const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

  const formatSelectedDateSpanish = (d) => {
    if (!d) return '';
    const day = d.getDate();
    const month = monthsFull[d.getMonth()];
    const year = d.getFullYear();
    return `${day} de ${month} de ${year}`;
  };
  const [userInteracted, setUserInteracted] = useState(false);
  const [previewTemp, setPreviewTemp] = useState(null);
  const [previewRain, setPreviewRain] = useState(null);
  const [previewCondition, setPreviewCondition] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const suggestionTimer = useRef(null);
  // track last push time per key so we only debounce immediate duplicates
  const lastPushedMapRef = useRef(new Map());
  const pushInProgressRef = useRef(false);

  useEffect(() => {
    console.log('HomeScreen mounted');
    return () => console.log('HomeScreen unmounted');
  }, []);

  useEffect(() => {
    console.log('userInteracted changed:', userInteracted, 'address:', address);
  }, [userInteracted, address]);

  useEffect(() => {
    const focus = route?.params?.focusLocation;
    if (focus && typeof focus.lat === 'number' && typeof focus.lon === 'number') {
      const lat = focus.lat;
      const lon = focus.lon;
      const latDelta = Math.min(deltas?.latitudeDelta || 0.04, 0.01);
      const lonDelta = Math.min(deltas?.longitudeDelta || 0.04, 0.01);
      const region = { latitude: lat, longitude: lon, latitudeDelta: latDelta, longitudeDelta: lonDelta };
      setDeltas({ latitudeDelta: latDelta, longitudeDelta: lonDelta });
      if (mapRef.current?.animateToRegion) mapRef.current.animateToRegion(region, 300);
      setLocation({ latitude: lat, longitude: lon });
      if (focus.label) {
        setAddress(focus.label);
        setLocationLabel(focus.label);
      } else {
        reverseGeocode(lat, lon);
      }
      setSuggestions([]);
      setUserInteracted(true);
      if (navigation.setParams) navigation.setParams({ focusLocation: undefined });
    }
  }, [route?.params?.focusLocation]);

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setLocation({ latitude: coordinate.latitude, longitude: coordinate.longitude });
    reverseGeocode(coordinate.latitude, coordinate.longitude).then((info) => {
      if (info && info.boundingbox && info.boundingbox.length === 4) {
        const latMin = parseFloat(info.boundingbox[0]);
        const latMax = parseFloat(info.boundingbox[1]);
        const lonMin = parseFloat(info.boundingbox[2]);
        const lonMax = parseFloat(info.boundingbox[3]);
        const paddingFactor = 1.3;
        const latDelta = Math.max((Math.abs(latMax - latMin) || 0.001) * paddingFactor, 0.002);
        const lonDelta = Math.max((Math.abs(lonMax - lonMin) || 0.001) * paddingFactor, 0.002);
        const region = { latitude: coordinate.latitude, longitude: coordinate.longitude, latitudeDelta: latDelta, longitudeDelta: lonDelta };
        setDeltas({ latitudeDelta: latDelta, longitudeDelta: lonDelta });
        if (mapRef.current && mapRef.current.animateToRegion) mapRef.current.animateToRegion(region, 300);
      } else {
        const hasRoad = info && info.address && (info.address.road || info.address.pedestrian || info.address.house_number);
        if (hasRoad) {
          const latDelta = Math.min(deltas.latitudeDelta, 0.01);
          const lonDelta = Math.min(deltas.longitudeDelta, 0.01);
          const region = { latitude: coordinate.latitude, longitude: coordinate.longitude, latitudeDelta: latDelta, longitudeDelta: lonDelta };
          setDeltas({ latitudeDelta: latDelta, longitudeDelta: lonDelta });
          if (mapRef.current && mapRef.current.animateToRegion) mapRef.current.animateToRegion(region, 300);
        } else {
          const region = { latitude: coordinate.latitude, longitude: coordinate.longitude, latitudeDelta: deltas.latitudeDelta, longitudeDelta: deltas.longitudeDelta };
          if (mapRef.current && mapRef.current.animateToRegion) mapRef.current.animateToRegion(region, 300);
        }
      }
    }).catch(() => {
      const region = { latitude: coordinate.latitude, longitude: coordinate.longitude, latitudeDelta: deltas.latitudeDelta, longitudeDelta: deltas.longitudeDelta };
      if (mapRef.current && mapRef.current.animateToRegion) mapRef.current.animateToRegion(region, 300);
    });
    setUserInteracted(true);
  };

  const reverseGeocode = async (lat, lon) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&countrycodes=${defaultCountryCode}`);
      const json = await res.json();
      setAddress(json.display_name || 'Unknown location');
      if (json.address) {
        const road = json.address.road || json.address.pedestrian || json.address.footway || '';
        const housenumber = json.address.house_number || '';
        const city = json.address.city || json.address.town || json.address.village || '';
        const state = json.address.county || json.address.state || '';
        const country = json.address.country || '';
        const streetPart = road ? (housenumber ? `${road} ${housenumber}` : road) : '';
        let label = '';
        if (streetPart) {
          label = [streetPart, city || state, country].filter(Boolean).join(', ');
        } else {
          label = [city || state, country].filter(Boolean).join(', ');
        }
        if (!label) label = json.display_name || 'Unknown location';
        setLocationLabel(label);
      }
      return json;
    } catch (err) {
      setAddress('Unable to resolve address');
      return null;
    } finally {
      setLoadingAddress(false);
    }
  };

  const forwardGeocode = async (query) => {
    if (!query) return;
    setLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=${defaultCountryCode}&q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json && json.length > 0) {
        const top = json[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);
        let latDelta = deltas.latitudeDelta;
        let lonDelta = deltas.longitudeDelta;
        if (top.boundingbox && top.boundingbox.length === 4) {
          const latMin = parseFloat(top.boundingbox[0]);
          const latMax = parseFloat(top.boundingbox[1]);
          const lonMin = parseFloat(top.boundingbox[2]);
          const lonMax = parseFloat(top.boundingbox[3]);
          const paddingFactor = 1.3;
          latDelta = Math.max((Math.abs(latMax - latMin) || 0.001) * paddingFactor, 0.002);
          lonDelta = Math.max((Math.abs(lonMax - lonMin) || 0.001) * paddingFactor, 0.002);
        } else {
          const hasRoad = top.address && (top.address.road || top.address.pedestrian || top.address.house_number);
          if (hasRoad) {
            latDelta = Math.min(deltas.latitudeDelta, 0.01);
            lonDelta = Math.min(deltas.longitudeDelta, 0.01);
          }
        }
        const region = { latitude: lat, longitude: lon, latitudeDelta: latDelta, longitudeDelta: lonDelta };
        setDeltas({ latitudeDelta: latDelta, longitudeDelta: lonDelta });
        if (mapRef.current && mapRef.current.animateToRegion) {
          mapRef.current.animateToRegion(region, 300);
        }
        setLocation({ latitude: lat, longitude: lon });
        setAddress(top.display_name || query);
        if (top.address) {
          const road = top.address.road || top.address.pedestrian || top.address.footway || '';
          const housenumber = top.address.house_number || '';
          const city = top.address.city || top.address.town || top.address.village || '';
          const state = top.address.county || top.address.state || '';
          const country = top.address.country || '';
          const streetPart = road ? (housenumber ? `${road} ${housenumber}` : road) : '';
          let label = '';
          if (streetPart) {
            label = [streetPart, city || state, country].filter(Boolean).join(', ');
          } else {
            label = [city || state, country].filter(Boolean).join(', ');
          }
          if (!label) label = top.display_name || query;
          setLocationLabel(label);
        } else if (top.display_name) {
          const parts = top.display_name.split(',').map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) setLocationLabel(`${parts[0]}, ${parts[parts.length-1]}`);
          else setLocationLabel(top.display_name);
        }
        setUserInteracted(true);
        // Save to history using top result (avoid duplicate saves for the same search)
        try {
          const entry = { type: 'search', label: top.display_name || query, lat, lon };
          const dateStr = (selectedDate || new Date()).toISOString();
          const key = `${lat}|${lon}|${dateStr}|${entry.label || ''}`;
          try {
            const lastMap = lastPushedMapRef.current;
            const now = Date.now();
            const lastTime = lastMap.get(key) || 0;
            // allow if last push was more than 5s ago
            if ((now - lastTime) > 5000 && !pushInProgressRef.current) {
              pushInProgressRef.current = true;
              await pushHistory(entry);
              lastMap.set(key, now);
              pushInProgressRef.current = false;
            }
          } catch (e) {}
        } catch(e){}
      } else {
        setAddress('No results');
      }
    } catch (err) {
      setAddress('Geocoding failed');
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchSuggestions = async (q) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    try {
      let url = '';
      if (q.includes(',')) {
        const parts = q.split(',').map(p => p.trim()).filter(Boolean);
        const street = parts[0] ? `street=${encodeURIComponent(parts[0])}` : '';
        const city = parts[1] ? `&city=${encodeURIComponent(parts[1])}` : '';
        url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=${defaultCountryCode}&limit=8&${street}${city}`;
      } else {
        url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=${defaultCountryCode}&q=${encodeURIComponent(q)}&limit=8`;
      }
      const res = await fetch(url);
      const json = await res.json();
      const mapped = (json || []).map(item => {
        if (item.address) {
          const road = item.address.road || item.address.pedestrian || item.address.footway || '';
          const housenumber = item.address.house_number || '';
          const city = item.address.city || item.address.town || item.address.village || '';
          const state = item.address.county || item.address.state || '';
          const country = item.address.country || '';
          const streetPart = road ? (housenumber ? `${road} ${housenumber}` : road) : '';
          const labelParts = [];
          if (streetPart) labelParts.push(streetPart);
          if (city) labelParts.push(city);
          if (state && !city) labelParts.push(state);
          if (country) labelParts.push(country);
          return { ...item, formattedLabel: labelParts.join(', ') || item.display_name };
        }
        return { ...item, formattedLabel: item.display_name };
      });
      setSuggestions(mapped);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const HISTORY_KEY = 'search_history';

  const pushHistory = async (entry) => {
    try {
      const API_BASE = 'http://localhost:8080';
      const body = {
        lat: entry.lat,
        lon: entry.lon,
        date: (selectedDate || new Date()).toISOString(),
        label: entry.label || entry.formattedLabel || undefined,
        saveHistory: true, // explicitly request server to save this entry
      };

      const res = await fetch(`${API_BASE}/probability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn('Failed to POST /probability', res.status);
        return;
      }

      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Failed to save history to /probability', e);
    }
  };

  useEffect(() => {
    let mounted = true;
    const API_BASE = 'http://localhost:8080';
    const fetchPreview = async () => {
      if (!userInteracted || !address) return;
      try {
        const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const res = await fetch(`${API_BASE}/probability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat: location.latitude, lon: location.longitude, date: dateStr, saveHistory: false }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const temp = json.temperature_max != null ? Math.round(json.temperature_max) : null;
        const rain = json.probability != null ? Math.round(json.probability * 100) : null;
        const condition = json.condition || null;
        setPreviewTemp(temp);
        setPreviewRain(rain);
        setPreviewCondition(condition);
      } catch (e) {
        setPreviewTemp(null);
        setPreviewRain(null);
        setPreviewCondition(null);
      }
    };
    fetchPreview();
    return () => { mounted = false; };
  }, [location.latitude, location.longitude, selectedDate, userInteracted, address]);

  const conditionEmoji = (condition) => {
    if (condition === 'sunny') return '☀️';
    if (condition === 'rainy') return '🌧️';
    if (condition === 'cloudy') return '☁️';
    if (condition === 'windy') return '🍃';
    return '';
  };

  const onChangeSearch = (text) => {
    setSearchText(text);
    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    suggestionTimer.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 350);
  };

  const selectSuggestion = async (item) => {
    // Clear suggestions and cancel any pending timer
    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    setSuggestions([]);
    setSearchText(item.display_name || '');
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    let latDelta = deltas.latitudeDelta;
    let lonDelta = deltas.longitudeDelta;
    if (item.boundingbox && item.boundingbox.length === 4) {
      const latMin = parseFloat(item.boundingbox[0]);
      const latMax = parseFloat(item.boundingbox[1]);
      const lonMin = parseFloat(item.boundingbox[2]);
      const lonMax = parseFloat(item.boundingbox[3]);
      const paddingFactor = 1.3;
      latDelta = Math.max((Math.abs(latMax - latMin) || 0.001) * paddingFactor, 0.002);
      lonDelta = Math.max((Math.abs(lonMax - lonMin) || 0.001) * paddingFactor, 0.002);
    } else {
      const hasRoad = item.address && (item.address.road || item.address.pedestrian || item.address.house_number);
      if (hasRoad) {
        latDelta = Math.min(deltas.latitudeDelta, 0.01);
        lonDelta = Math.min(deltas.longitudeDelta, 0.01);
      }
    }
    const region = { latitude: lat, longitude: lon, latitudeDelta: latDelta, longitudeDelta: lonDelta };
    setDeltas({ latitudeDelta: latDelta, longitudeDelta: lonDelta });
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, 300);
    }
    setLocation({ latitude: lat, longitude: lon });
    setAddress(item.display_name || '');
    if (item.address) {
      const road = item.address.road || item.address.pedestrian || item.address.footway || '';
      const housenumber = item.address.house_number || '';
      const city = item.address.city || item.address.town || item.address.village || '';
      const state = item.address.county || item.address.state || '';
      const country = item.address.country || '';
      const streetPart = road ? (housenumber ? `${road} ${housenumber}` : road) : '';
      let label = '';
      if (streetPart) {
        label = [streetPart, city || state, country].filter(Boolean).join(', ');
      } else {
        label = [city || state, country].filter(Boolean).join(', ');
      }
      if (!label) label = item.display_name || '';
      setLocationLabel(label);
    }
    setUserInteracted(true);
  };

  const handleDownloadWeather = () => {
    navigation.navigate('Forecast', { city: 'Montevideo', selectedDate: (selectedDate || new Date()).toISOString(), locationLabel, lat: location.latitude, lon: location.longitude, previewTemp, previewRain, previewCondition });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: deltas.latitudeDelta,
            longitudeDelta: deltas.longitudeDelta,
          }}
          onPress={handleMapPress}
          onRegionChangeComplete={(region) => {
            setDeltas({ latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta });
          }}
        >
            {userInteracted ? <Marker coordinate={location} /> : null}
        </MapView>

        <View style={styles.searchBar} pointerEvents="box-none">
          <TouchableOpacity onPress={() => setProfileOpen(true)}>
            <Image source={require('../assets/monkey.png')} style={[styles.searchAvatar, { resizeMode: 'cover' }]} />
          </TouchableOpacity>
          <TextInput
            placeholder="Buscar"
            placeholderTextColor="#A8B6C2"
            style={styles.searchInput}
            value={searchText}
            onChangeText={onChangeSearch}
            onSubmitEditing={() => forwardGeocode(searchText)}
            returnKeyType="search"
          />
          {loadingAddress ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <TouchableOpacity onPress={() => forwardGeocode(searchText)} accessibilityLabel="Buscar" accessibilityRole="button">
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          )}
        </View>

        <ProfileModal visible={profileOpen} onClose={() => setProfileOpen(false)} onSelect={(id) => {
          console.log('Profile menu select:', id);
        }} navigation={navigation} />

        {address ? (
          <View style={styles.addressBubble} pointerEvents="none">
            <Text style={{ color: '#fff', textAlign: 'center', width: '100%' }} numberOfLines={2} ellipsizeMode="tail">
              {address}
            </Text>
          </View>
        ) : null}

        {suggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(it, idx) => (it.place_id || idx).toString()}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback onPress={() => selectSuggestion(item)}>
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>{item.formattedLabel || item.display_name}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.dateBubble}
          pointerEvents="box-none"
          onPress={() => {
            const d = selectedDate || new Date();
            setCalendarMonth(d.getMonth());
            setCalendarYear(d.getFullYear());
            setCalendarView('days');
            setYearPageStart(d.getFullYear() - 6);
            setShowDatePicker(true);
          }}
        >
          <Text style={{ color: '#fff' }}>{formatSelectedDateSpanish(selectedDate)}</Text>
        </TouchableOpacity>

        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <View style={{ backgroundColor: '#0F2B3A', padding: 12, borderRadius: 12, width: 340 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity onPress={() => {
                  if (calendarView === 'days') {
                    const prev = new Date(calendarYear, calendarMonth - 1, 1);
                    setCalendarMonth(prev.getMonth());
                    setCalendarYear(prev.getFullYear());
                  } else if (calendarView === 'years') {
                    setYearPageStart(yearPageStart - 12);
                  }
                }}>
                  <Text style={{ color: '#fff', fontSize: 20 }}>◀</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setCalendarView('months')}>
                    <Text style={{ color: '#fff', fontWeight: '600', marginRight: 8 }}>{capitalize(monthsFull[calendarMonth])}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCalendarView('years')}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>{calendarYear}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => {
                  if (calendarView === 'days') {
                    const next = new Date(calendarYear, calendarMonth + 1, 1);
                    setCalendarMonth(next.getMonth());
                    setCalendarYear(next.getFullYear());
                  } else if (calendarView === 'years') {
                    setYearPageStart(yearPageStart + 12);
                  }
                }}>
                  <Text style={{ color: '#fff', fontSize: 20 }}>▶</Text>
                </TouchableOpacity>
              </View>

              {calendarView === 'days' && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    {weekdaysShort.map((w)=> (
                      <Text key={w} style={{ color: '#CFE9FF', width: 40, textAlign: 'center' }}>{w}</Text>
                    ))}
                  </View>
                  {(() => {
                    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const rows = [];
                    let cells = [];
                    for (let i=0;i<firstDay;i++) cells.push(null);
                    for (let d=1; d<=daysInMonth; d++) {
                      cells.push(d);
                    }
                    while (cells.length) {
                      rows.push(cells.splice(0,7));
                    }
                    return rows.map((row, ri) => (
                      <View key={ri} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        {row.map((day, ci) => {
                          if (!day) return <View key={ci} style={{ width: 40 }} />;
                          const isSelected = selectedDate && selectedDate.getFullYear()===calendarYear && selectedDate.getMonth()===calendarMonth && selectedDate.getDate()===day;
                          return (
                            <TouchableOpacity key={ci} onPress={() => {
                              const picked = new Date(calendarYear, calendarMonth, day);
                              setSelectedDate(picked);
                              setShowDatePicker(false);
                              setUserInteracted(true);
                            }} style={{ width: 40, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: isSelected ? '#4A90E2' : 'transparent' }}>
                              <Text style={{ color: isSelected ? '#fff' : '#E6F3FF' }}>{day}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))
                  })()}
                </View>
              )}

              {calendarView === 'months' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {Array.from({length:12}).map((_, idx) => (
                    <TouchableOpacity key={idx} onPress={() => { setCalendarMonth(idx); setCalendarView('days'); }} style={{ width: '30%', padding: 8, marginBottom: 8 }}>
                      <Text style={{ color: idx===calendarMonth ? '#4A90E2' : '#E6F3FF', textAlign: 'center' }}>{monthsShort[idx]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {calendarView === 'years' && (
                <View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Array.from({length:12}).map((_, idx) => {
                      const y = yearPageStart + idx;
                      return (
                        <TouchableOpacity key={y} onPress={() => { setCalendarYear(y); setCalendarView('days'); }} style={{ width: '30%', padding: 8, marginBottom: 8 }}>
                          <Text style={{ color: y===calendarYear ? '#4A90E2' : '#E6F3FF', textAlign: 'center' }}>{y}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ marginRight: 12 }}>
                  <Text style={{ color: '#CFE9FF' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowDatePicker(false); }}>
                  <Text style={{ color: '#4A90E2' }}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {userInteracted && address ? (
          <View style={styles.bottomContainer} testID="home-bottom-container">
            <Text style={styles.cityName} numberOfLines={2} ellipsizeMode="tail">{locationLabel}</Text>
            <Text style={styles.tempText}>{previewTemp != null ? previewTemp + '°' : '--'} {conditionEmoji(previewCondition) || ''} | 💧 {previewRain != null ? previewRain + '%' : '--'}</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Forecast', { city: 'Montevideo', selectedDate: (selectedDate || new Date()).toISOString(), locationLabel, lat: location.latitude, lon: location.longitude, previewTemp, previewRain, previewCondition })}>
              <Text style={styles.buttonText}>Ver Clima</Text>
            </TouchableOpacity>
            <Text style={styles.coordsText}>Lat: {location.latitude.toFixed(4)}  Lon: {location.longitude.toFixed(4)}</Text>
          </View>
        ) : null}

      </View>
    </SafeAreaView>
  );
}
