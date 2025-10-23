import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0F2B3A', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { color: '#CFE9FF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  item: { paddingVertical: 12 },
  itemText: { color: '#E6F3FF', fontSize: 16 },
  closeBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  closeText: { color: '#9EC3FF' },
});
