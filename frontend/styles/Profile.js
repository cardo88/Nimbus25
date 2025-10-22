import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16222A', alignItems: 'center', paddingTop: 32 },
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#0F2B3A' },
  form: { width: '90%', maxWidth: 340, backgroundColor: '#1B3142', borderRadius: 12, padding: 20 },
  label: { color: '#CFE9FF', fontSize: 14, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#223A4F', color: '#E6F3FF', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  editBtn: { backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  editText: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2ECC71', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  saveText: { color: '#fff', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  logoutText: { color: '#fff', fontWeight: '600' },
});
