import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';

// Conditionally import HealthConnect
let HealthConnect;
try {
  // Only attempt to import on Android, as Health Connect is Android-specific
  if (Platform.OS === 'android') {
    HealthConnect = require('react-native-health-connect').default;
  }
} catch (error) {
  console.log('HealthConnect module not available:', error);
}

const HealthConnectScreen = () => {
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [sleepData, setSleepData] = useState([]);
  const [heartRateData, setHeartRateData] = useState([]);
  const [isFetchingSleep, setIsFetchingSleep] = useState(false);
  const [sleepError, setSleepError] = useState(null);
  const [isFetchingHeartRate, setIsFetchingHeartRate] = useState(false);
  const [heartRateError, setHeartRateError] = useState(null);

  useEffect(() => {
    const checkHealthConnectAvailability = async () => {
      // Only available on Android and when not in Expo Go
      const isAvailable = !!HealthConnect && Platform.OS === 'android';
      setIsHealthConnectAvailable(isAvailable);
      
      if (isAvailable) {
        try {
          // Check if Health Connect is installed on the device
          const isInstalled = await HealthConnect.isProviderAvailable();
          if (!isInstalled) {
            console.log('Health Connect is not installed on this device');
            setIsHealthConnectAvailable(false);
            return;
          }
          
          await checkAndRequestPermissions();
        } catch (error) {
          console.error('Error checking Health Connect availability:', error);
          setIsHealthConnectAvailable(false);
        }
      }
    };
    
    checkHealthConnectAvailability();
  }, []);

  const checkAndRequestPermissions = async () => {
    if (!isHealthConnectAvailable) return;
    
    try {
      const permissions = ['SleepSession.READ', 'HeartRate.READ'];
      const granted = await HealthConnect.requestPermissions(permissions);
      setPermissionsGranted(granted);
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionsGranted(false);
    }
  };

  const fetchSleepData = async () => {
    if (!isHealthConnectAvailable || !permissionsGranted) {
      console.warn(
        !isHealthConnectAvailable
          ? 'HealthConnect not available'
          : 'Permissions not granted'
      );
      return;
    }
    
    setIsFetchingSleep(true);
    setSleepError(null);
    
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      
      const result = await HealthConnect.readRecords('SleepSession', {
        timeRangeFilter: { 
          operator: 'between',
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString() 
        },
      });
      
      setSleepData(result.records || []);
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      setSleepError(error.message || "Unknown error occurred");
    } finally {
      setIsFetchingSleep(false);
    }
  };

  const fetchHeartRateData = async () => {
    if (!isHealthConnectAvailable || !permissionsGranted) {
      console.warn(
        !isHealthConnectAvailable
          ? 'HealthConnect not available'
          : 'Permissions not granted'
      );
      return;
    }
    
    setIsFetchingHeartRate(true);
    setHeartRateError(null);
    
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      const result = await HealthConnect.readRecords('HeartRate', {
        timeRangeFilter: { 
          operator: 'between',
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString() 
        },
      });
      
      setHeartRateData(result.records || []);
    } catch (error) {
      console.error('Failed to fetch heart rate data:', error);
      setHeartRateError(error.message || "Unknown error occurred");
    } finally {
      setIsFetchingHeartRate(false);
    }
  };

  const calculateDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);
    const hours = durationMs / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Health Connect Data</Text>
      
      {!isHealthConnectAvailable ? (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            HealthConnect features are not available. This feature requires:
            {'\n'}- Android device
            {'\n'}- Health Connect app installed
            {'\n'}- Development build (not Expo Go)
          </Text>
          {Platform.OS === 'android' && (
            <Button 
              title="Check Availability Again" 
              onPress={() => checkAndRequestPermissions()} 
            />
          )}
        </View>
      ) : !permissionsGranted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Permissions not granted. Please grant permissions to access health data.
          </Text>
          <Button 
            title="Request Permissions" 
            onPress={checkAndRequestPermissions} 
          />
        </View>
      ) : (
        <>
          <View style={styles.dataContainer}>
            <Text style={styles.subtitle}>Sleep Data</Text>
            <Button 
              title="Fetch Sleep Data" 
              onPress={fetchSleepData} 
              disabled={isFetchingSleep}
            />
            
            {isFetchingSleep ? (
              <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
            ) : sleepError ? (
              <Text style={styles.errorText}>Error: {sleepError}</Text>
            ) : (
              <View>
                {sleepData.length === 0 ? (
                  <Text style={styles.noDataText}>No sleep data available.</Text>
                ) : (
                  sleepData.map((session, index) => (
                    <View key={index} style={styles.dataItem}>
                      <Text>Start: {new Date(session.startTime).toLocaleString()}</Text>
                      <Text>End: {new Date(session.endTime).toLocaleString()}</Text>
                      <Text>
                        Duration: {calculateDuration(session.startTime, session.endTime)}{' '}
                        hours
                      </Text>
                      <Text>
                        Stages: {session.stages ? JSON.stringify(session.stages) : 'N/A'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
          
          <View style={styles.dataContainer}>
            <Text style={styles.subtitle}>Heart Rate Data</Text>
            <Button 
              title="Fetch Heart Rate Data" 
              onPress={fetchHeartRateData} 
              disabled={isFetchingHeartRate}
            />
            
            {isFetchingHeartRate ? (
              <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
            ) : heartRateError ? (
              <Text style={styles.errorText}>Error: {heartRateError}</Text>
            ) : (
              <View>
                {heartRateData.length === 0 ? (
                  <Text style={styles.noDataText}>No heart rate data available.</Text>
                ) : (
                  heartRateData.map((record, index) => (
                    <View key={index} style={styles.dataItem}>
                      <Text>Time: {new Date(record.time).toLocaleString()}</Text>
                      <Text>BPM: {record.beatsPerMinute}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    marginBottom: 15,
  },
  permissionContainer: {
    backgroundColor: '#FFEEBA',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  permissionText: {
    color: '#856404',
    textAlign: 'center',
    marginBottom: 10,
  },
  dataContainer: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 5,
    borderRadius: 3,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  noDataText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
  loader: {
    marginVertical: 10,
  },
});

export default HealthConnectScreen;