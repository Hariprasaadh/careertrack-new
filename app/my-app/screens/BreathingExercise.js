import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from 'react-native';

const BreathingExercise = ({ navigation }) => {
  // Exercise state management
  const [status, setStatus] = useState('idle'); // idle, inhale, hold, exhale, holdAfterExhale
  const [timer, setTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const intervalRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState('4-7-8');
  const [animatedValue] = useState(new Animated.Value(1));
  const currentPhaseIndexRef = useRef(0);
  const completedCyclesRef = useRef(0);

  // Define breathing exercise types with exact specifications
  const exercises = {
    '4-7-8': { 
      name: '4-7-8 Breathing',
      subtitle: 'Relaxation & Sleep Aid',
      sequence: [
        { phase: 'inhale', duration: 4, instruction: 'Inhale through your nose' },
        { phase: 'hold', duration: 7, instruction: 'Hold your breath' },
        { phase: 'exhale', duration: 8, instruction: 'Exhale slowly through your mouth' }
      ],
      totalCycles: 5, // 4-5 times
      color: '#4A90E2', 
      description: 'Best for: Stress relief, anxiety reduction, and better sleep.'
    },
    'box': { 
      name: 'Box Breathing',
      subtitle: 'Focus & Stress Control',
      sequence: [
        { phase: 'inhale', duration: 4, instruction: 'Inhale through your nose' },
        { phase: 'hold', duration: 4, instruction: 'Hold your breath' },
        { phase: 'exhale', duration: 4, instruction: 'Exhale through your mouth' },
        { phase: 'holdAfterExhale', duration: 4, instruction: 'Hold again before repeating' }
      ],
      totalCycles: 8, // 1-2 minutes (each cycle is 16 seconds)
      color: '#5E35B1', 
      description: 'Best for: Enhancing focus, calming nerves, and managing stress.'
    },
    'deep': { 
      name: 'Deep Breathing',
      subtitle: 'General Relaxation',
      sequence: [
        { phase: 'inhale', duration: 5, instruction: 'Inhale slowly through your nose into your belly' },
        { phase: 'exhale', duration: 6, instruction: 'Exhale fully through your mouth' }
      ],
      totalCycles: 30, // 5-10 minutes (each cycle is 11 seconds)
      color: '#43A047', 
      description: 'Best for: Relaxation, improving oxygen flow, and reducing tension.'
    },
    'calming': { 
      name: 'Calming Breathing',
      subtitle: 'Gentle & Soothing',
      sequence: [
        { phase: 'inhale', duration: 4, instruction: 'Breathe in slowly and deeply through your nose' },
        { phase: 'exhale', duration: 8, instruction: 'Exhale even slower, letting go of tension' }
      ],
      totalCycles: 20, // Around 4 minutes
      color: '#FB8C00', 
      description: 'Best for: Easing anxiety, calming the nervous system, and grounding yourself.'
    }
  };

  // Animation control
  const animateCircle = (phase) => {
    // Reset any ongoing animation
    animatedValue.stopAnimation();
    
    if (phase === 'inhale') {
      Animated.timing(animatedValue, {
        toValue: 1.3,
        duration: getCurrentPhase().duration * 1000,
        easing: Easing.linear,
        useNativeDriver: true
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: getCurrentPhase().duration * 1000,
        easing: Easing.linear,
        useNativeDriver: true
      }).start();
    }
  };

  // Get current phase from sequence
  const getCurrentPhase = () => {
    if (status === 'idle') {
      return { phase: 'idle', duration: 0, instruction: 'Select a technique and press Start' };
    }
    
    return exercises[selectedExercise].sequence[currentPhaseIndexRef.current];
  };

  // Move to the next breathing phase
  const moveToNextPhase = () => {
    const sequence = exercises[selectedExercise].sequence;
    
    // Move to next phase in sequence
    currentPhaseIndexRef.current = (currentPhaseIndexRef.current + 1) % sequence.length;
    
    // If we've completed one full cycle (returned to the first phase)
    if (currentPhaseIndexRef.current === 0) {
      completedCyclesRef.current += 1;
      setCycleCount(completedCyclesRef.current);
      
      // Check if we've completed all cycles
      if (completedCyclesRef.current >= totalCycles) {
        setTimeout(() => stopExercise(), 100);
        return;
      }
    }
    
    // Set new phase
    const nextPhase = sequence[currentPhaseIndexRef.current];
    setStatus(nextPhase.phase);
    setTimer(nextPhase.duration);
    
    if (nextPhase.phase === 'inhale' || nextPhase.phase === 'exhale') {
      animateCircle(nextPhase.phase);
    }
  };

  // Start the breathing exercise
  const startExercise = () => {
    // Reset all counters and references
    completedCyclesRef.current = 0;
    currentPhaseIndexRef.current = 0;
    setCycleCount(0);
    setTotalCycles(exercises[selectedExercise].totalCycles);
    
    // Start with the first phase
    const firstPhase = exercises[selectedExercise].sequence[0];
    setStatus(firstPhase.phase);
    setTimer(firstPhase.duration);

    // Initialize animation if needed
    if (firstPhase.phase === 'inhale') {
      animateCircle('inhale');
    }
    
    // Clear any existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up the timer
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          moveToNextPhase();
          return 0; // Will be updated in moveToNextPhase
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Stop the breathing exercise
  const stopExercise = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset all states and refs
    setStatus('idle');
    setTimer(0);
    setCycleCount(0);
    completedCyclesRef.current = 0;
    currentPhaseIndexRef.current = 0;
    animatedValue.setValue(1);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Select a breathing exercise
  const selectExercise = (exerciseKey) => {
    if (status === 'idle') {
      setSelectedExercise(exerciseKey);
    }
  };

  const animatedStyles = {
    transform: [{ scale: animatedValue }]
  };

  // Function to get current phase instruction
  const getCurrentInstruction = () => {
    const currentPhase = getCurrentPhase();
    return currentPhase ? currentPhase.instruction : 'Select a technique and press Start';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Breathing Exercise</Text>
      
      {status === 'idle' && (
        <View style={styles.exerciseSelector}>
          <Text style={styles.sectionTitle}>Choose a Technique:</Text>
          {Object.keys(exercises).map((key) => (
            <TouchableOpacity 
              key={key}
              style={[
                styles.exerciseOption, 
                { backgroundColor: exercises[key].color },
                selectedExercise === key && styles.selectedExercise
              ]}
              onPress={() => selectExercise(key)}
            >
              <Text style={styles.exerciseName}>{exercises[key].name}</Text>
              <Text style={styles.exerciseSubtitle}>{exercises[key].subtitle}</Text>
              <Text style={styles.exerciseDescription}>{exercises[key].description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.circleContainer}>
        <Animated.View 
          style={[
            styles.circle, 
            { backgroundColor: exercises[selectedExercise].color },
            status !== 'idle' && animatedStyles
          ]}
        >
          <Text style={styles.statusText}>{getCurrentInstruction()}</Text>
          {status !== 'idle' && (
            <Text style={styles.timerText}>{timer}</Text>
          )}
          {status !== 'idle' && (
            <Text style={styles.cycleText}>
              Cycle {cycleCount + 1}/{totalCycles}
            </Text>
          )}
        </Animated.View>
      </View>

      <View style={styles.infoContainer}>
        {status !== 'idle' && (
          <View style={styles.exerciseInfo}>
            <Text style={styles.currentExerciseName}>
              {exercises[selectedExercise].name}
            </Text>
            <Text style={styles.currentExerciseSubtitle}>
              {exercises[selectedExercise].subtitle}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        {status === 'idle' ? (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: exercises[selectedExercise].color }]} 
            onPress={startExercise}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#E53935' }]} 
            onPress={stopExercise}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#333',
  },
  exerciseSelector: {
    width: '100%',
    marginBottom: 20,
  },
  exerciseOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedExercise: {
    borderWidth: 3,
    borderColor: '#333',
  },
  exerciseName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  exerciseSubtitle: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  exerciseDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    padding: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerText: {
    color: 'white',
    fontSize: 60,
    fontWeight: 'bold',
  },
  cycleText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  exerciseInfo: {
    alignItems: 'center',
  },
  currentExerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  currentExerciseSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BreathingExercise;