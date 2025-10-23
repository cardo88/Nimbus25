import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#16222A',
  },
  container: {
    flex: 1,
    backgroundColor: '#16222A',
    paddingTop: 12,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#22303C',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  monkeyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monkeyIcon: {
    width: 110,
    height: 110,
  },
  recommendationText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
  },
  detailBox: {
    backgroundColor: '#22303C',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 28,
    paddingVertical: 14,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0F2B3A',
    fontWeight: 'bold',
  },
  detailDate: {
    color: '#FFF',
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
});
