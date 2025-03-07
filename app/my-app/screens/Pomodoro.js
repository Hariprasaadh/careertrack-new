import { useUser } from "@clerk/clerk-expo";
import { supabase } from '../supabase/config';
import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Pomodoro = ({ navigation }) => {
  const { user } = useUser();
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [userSessions, setUserSessions] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [activeDuration, setActiveDuration] = useState(0);
  
  // Settings
  const workDuration = 25;
  const breakDuration = 5;
  const longBreakDuration = 15;
  const cyclesBeforeLongBreak = 4;

  // Refs
  const timerIntervalRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Session tracking with improved error handling
  const logSession = async (sessionType, duration) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      if (!sessionStartTime) {
        throw new Error("Invalid session timing");
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          user_id: user.id,  // Stored as text
          session_type: sessionType,
          start_time: sessionStartTime.toISOString(),
          end_time: new Date().toISOString(),
          duration
        }])
        .select('*');

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (data) {
        setUserSessions(prev => [...data, ...prev]);
        console.log("Session saved successfully:", data);
      }
    } catch (error) {
      console.error("Session logging failed:", error.message);
      // Add user-facing error message here
    }
  };

  // Auto-save functionality
  const checkAutoSave = () => {
    if (activeDuration >= 120) {
      logSession(isWorkSession ? 'work' : 'break', activeDuration);
    }
  };

  // Fetch sessions with error handling
  const loadSessions = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserSessions(data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error.message);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user?.id]);

  // Timer controls
  const startTimer = () => {
    setIsRunning(true);
    setSessionStartTime(new Date());
    setActiveDuration(0);
    animateProgress();

    durationIntervalRef.current = setInterval(() => {
      setActiveDuration(prev => prev + 1);
    }, 1000);

    timerIntervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          if (minutes === 0) {
            handleSessionComplete();
            return 0;
          }
          setMinutes(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSessionComplete = async () => {
    try {
      await logSession(isWorkSession ? 'work' : 'break', activeDuration);
      
      if (isWorkSession) {
        setCompletedCycles(prev => prev + 1);
      }

      const nextIsWork = !isWorkSession;
      const nextDuration = nextIsWork 
        ? workDuration 
        : (completedCycles + 1) % cyclesBeforeLongBreak === 0 
          ? longBreakDuration 
          : breakDuration;

      setIsWorkSession(nextIsWork);
      setMinutes(nextDuration);
      setSeconds(0);
    } catch (error) {
      console.error("Session completion error:", error);
    } finally {
      setIsRunning(false);
      animatedValue.setValue(0);
      setSessionStartTime(null);
      setActiveDuration(0);
      clearIntervals();
    }
  };

  const pauseTimer = () => {
    clearIntervals();
    animatedValue.stopAnimation();
    setIsRunning(false);
    checkAutoSave();
  };

  const resetTimer = () => {
    pauseTimer();
    setIsWorkSession(true);
    setMinutes(workDuration);
    setSeconds(0);
    animatedValue.setValue(0);
    setSessionStartTime(null);
    setActiveDuration(0);
  };

  const clearIntervals = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    timerIntervalRef.current = null;
    durationIntervalRef.current = null;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearIntervals();
      if (isRunning) checkAutoSave();
    };
  }, []);

  // Animation config
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const animateProgress = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: (minutes * 60 + seconds) * 1000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Pomodoro Timer</Text>

      {/* Session Status */}
      <View style={styles.sessionStatusContainer}>
        <Text style={[styles.sessionText, { color: isWorkSession ? '#FF6B6B' : '#4ECDC4' }]}>
          {isWorkSession ? 'FOCUS SESSION' : 'BREAK TIME'}
        </Text>
        <Text style={styles.cycleText}>Completed cycles: {completedCycles}</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircleBackground}>
          <Svg width={240} height={240}>
            <AnimatedCircle
              cx={120}
              cy={120}
              r={radius}
              stroke={isWorkSession ? '#FF6B6B' : '#4ECDC4'}
              strokeWidth={15}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.timerLabel}>
              {isWorkSession ? 'Focus' : 'Break'}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.buttonRow}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isWorkSession ? '#FF6B6B' : '#4ECDC4' }]}
            onPress={startTimer}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFD166' }]}
            onPress={pauseTimer}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Session History */}
      <Text style={styles.sectionTitle}>Session History</Text>
      <View style={styles.historyContainer}>
        {userSessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={[
                styles.sessionType,
                { color: session.session_type === 'work' ? '#FF6B6B' : '#4ECDC4' }
              ]}>
                {session.session_type.toUpperCase()}
              </Text>
              <Text style={styles.sessionDuration}>
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </Text>
            </View>
            <Text style={styles.sessionTime}>
              {new Date(session.start_time).toLocaleDateString()}{' '}
              {new Date(session.start_time).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Navigation */}
      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sessionStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cycleText: {
    fontSize: 16,
    color: '#666',
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerCircleBackground: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  timerDisplay: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  timerLabel: {
    fontSize: 18,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
  },
  backButton: {
    backgroundColor: '#6c757d',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 15,
    color: '#333',
  },
  historyContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sessionType: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sessionDuration: {
    color: '#666',
  },
  sessionTime: {
    color: '#999',
    fontSize: 12,
  },
});

export default Pomodoro;