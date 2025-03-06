import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const Pomodoro = ({ navigation }) => {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const timerIntervalRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Settings with customizable options
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);
  
  // Pomodoro benefits information
  const benefitCards = [
    {
      title: "Enhanced Focus",
      description: "The 25-minute focused sessions help improve concentration while minimizing distractions. Studies show that time-boxing your work increases productive output.",
      color: "#FF6B6B"
    },
    {
      title: "Reduced Mental Fatigue",
      description: "Regular breaks prevent burnout and mental exhaustion, helping maintain high cognitive performance throughout the day.",
      color: "#4ECDC4"
    },
    {
      title: "Better Time Management",
      description: "Breaking work into manageable chunks helps you understand how long tasks really take and improves your ability to estimate time.",
      color: "#FFD166"
    },
    {
      title: "Increased Accountability",
      description: "Each Pomodoro session creates a sense of urgency and commitment to complete specific tasks within the allocated time.",
      color: "#6D78AD"
    }
  ];

  // Start timer
  const startTimer = () => {
    setIsRunning(true);
    
    // Start animation
    animateProgress();
    
    timerIntervalRef.current = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds === 0) {
          if (minutes === 0) {
            // Timer completed
            handleSessionComplete();
            return 0;
          }
          setMinutes(prevMinutes => prevMinutes - 1);
          return 59;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };
  
  // Handle session completion
  const handleSessionComplete = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    
    // If it was a work session, increment the completed cycles
    if (isWorkSession) {
      setCompletedCycles(prev => prev + 1);
    }
    
    // Determine next session type
    setIsWorkSession(prev => !prev);
    
    // Determine duration of next session
    if (isWorkSession) {
      // Finished work session, starting break
      // Check if it's time for a long break
      const isLongBreak = (completedCycles + 1) % cyclesBeforeLongBreak === 0 && completedCycles > 0;
      setMinutes(isLongBreak ? longBreakDuration : breakDuration);
    } else {
      // Finished break, starting work
      setMinutes(workDuration);
    }
    
    setSeconds(0);
    setIsRunning(false);
    animatedValue.setValue(0); // Reset progress animation
  };
  
  // Animate the progress circle
  const animateProgress = () => {
    const totalDuration = (minutes * 60 + seconds) * 1000;
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: totalDuration,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Pause animation
    animatedValue.stopAnimation();
    
    setIsRunning(false);
  };
  
  // Reset timer
  const resetTimer = () => {
    pauseTimer();
    setIsWorkSession(true);
    setMinutes(workDuration);
    setSeconds(0);
    animatedValue.setValue(0);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
  // Calculate circular progress
  const circleColor = isWorkSession ? '#FF6B6B' : '#4ECDC4';
  const finalCircleColor = isWorkSession ? '#8B0000' : '#006400';
  
  const circleColorValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circleColor, finalCircleColor]
  });
  
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Pomodoro Timer</Text>
      
      <View style={styles.sessionStatusContainer}>
        <Text style={[
          styles.sessionText,
          {color: isWorkSession ? '#FF6B6B' : '#4ECDC4'}
        ]}>
          {isWorkSession ? 'FOCUS SESSION' : 'BREAK TIME'}
        </Text>
        <Text style={styles.cycleText}>
          Cycles completed: {completedCycles}
        </Text>
      </View>
      
      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircleBackground}>
          <View style={styles.progressBackground}>
            <Svg width={240} height={240}>
              <AnimatedCircle
                cx={120}
                cy={120}
                r={radius}
                stroke={circleColorValue}
                strokeWidth={15}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>
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
      
      {/* Control Buttons */}
      <View style={styles.buttonRow}>
        {!isRunning ? (
          <TouchableOpacity 
            style={[styles.button, {backgroundColor: isWorkSession ? '#FF6B6B' : '#4ECDC4'}]} 
            onPress={startTimer}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, {backgroundColor: '#FFD166'}]} 
            onPress={pauseTimer}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetTimer}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* Benefits Section */}
      <Text style={styles.benefitsTitle}>Benefits of Pomodoro Technique</Text>
      
      <View style={styles.benefitsContainer}>
        {benefitCards.map((benefit, index) => (
          <View 
            key={index} 
            style={[styles.benefitCard, {backgroundColor: benefit.color}]}
          >
            <Text style={styles.benefitTitle}>{benefit.title}</Text>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
          </View>
        ))}
      </View>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={[styles.button, styles.backButton]} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Create the animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
    marginTop: 10,
  },
  sessionStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  cycleText: {
    fontSize: 16,
    color: '#666',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerCircleBackground: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  progressBackground: {
    position: 'absolute',
    width: 240,
    height: 240,
  },
  timerDisplay: {
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
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resetButton: {
    backgroundColor: '#E74C3C',
  },
  backButton: {
    backgroundColor: '#757575',
    width: '100%',
    marginTop: 10, 
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  benefitCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
});

export default Pomodoro;