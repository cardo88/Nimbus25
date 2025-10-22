import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16222A', paddingTop: 16, paddingBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20, paddingTop: 12 },
  title: { color: '#CFE9FF', fontSize: 20, fontWeight: '700' },
  clear: { color: '#E53935', paddingVertical: 6, paddingRight: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 12 },
  label: { color: '#E6F3FF', fontSize: 16 },
  sub: { color: '#9EC3FF', fontSize: 12, marginTop: 4 },
  chevron: { color: '#9EC3FF', fontSize: 18, marginLeft: 8 },
  deleteBtn: { paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  deleteIcon: { fontSize: 14, opacity: 0.6 },
  empty: { color: '#9EC3FF', textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
});
