import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser, useAuth } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

const QuoteCard = ({ quote, author }) => {
  return (
    <LinearGradient
      colors={['#F8FBFF', '#EAF2FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quoteCard}
    >
      <Text style={styles.quoteText}>"{quote}"</Text>
      <Text style={styles.quoteAuthor}>- {author}</Text>
    </LinearGradient>
  );
};

const NavigationCard = ({ title, icon, colors, onPress }) => {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navCardGradient}
      >
        <View style={styles.navIconContainer}>
          {icon}
        </View>
        <Text style={styles.navText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const TodoItem = ({ item, onToggleComplete, onDelete }) => {
  return (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => onToggleComplete(item.id)}>
        {item.completed ? 
          <AntDesign name="checkcircle" size={20} color="#4CAF50" /> : 
          <Feather name="circle" size={20} color="#888" />
        }
      </TouchableOpacity>
      <Text style={[
        styles.todoText, 
        item.completed && styles.todoCompleted
      ]}>
        {item.text}
      </Text>
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Feather name="trash-2" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );
};

const Dashboard = ({ navigation }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, isLoaded: isAuthLoaded } = useAuth();
  
  // State for todos and UI
  const [scrollX] = useState(new Animated.Value(0));
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([
    { id: '1', text: 'Complete math assignment', completed: false },
    { id: '2', text: 'Read chapter 5', completed: true },
    { id: '3', text: 'Prepare for presentation', completed: false },
  ]);
  
  // Get user data from Clerk
  const profileImageUrl = isUserLoaded ? (user?.imageUrl || user?.profileImageUrl) : 'https://via.placeholder.com/60';
  const username = isUserLoaded ? (user?.fullName || user?.username || 'Student') : 'Loading...';
  
  // Track user's todo completion stats
  const completedTasks = todos.filter(todo => todo.completed).length;
  const totalTasks = todos.length;

  const educationalQuotes = [
    { id: 1, quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { id: 2, quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { id: 3, quote: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
    { id: 4, quote: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { id: 5, quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  ];

  const addTodo = () => {
    if (todoText.trim() === '') return;
    
    const newTodo = {
      id: Date.now().toString(),
      text: todoText,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setTodoText('');
  };

  const toggleTodoComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const handleSignOut = async () => {
    try {
      if (!isAuthLoaded) return;
      
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Sign Out", 
            onPress: async () => {
              await signOut();
              // The navigation will be handled by the auth state change in App.js
            },
            style: "destructive"
          }
        ]
      );
    } catch (err) {
      console.error("Sign out error:", err);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F9FAFC']}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.container}>
        {/* User Profile Section */}
        <LinearGradient
          colors={['#F0F7FF', '#E6F0FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <Image 
            source={{ uri: profileImageUrl }} 
            style={styles.profileImage} 
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.profileInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.userName}>{username}</Text>
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF5252" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userDetails}>Student • Focus Level: Pro</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Hours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedTasks}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quotes Carousel */}
        <View style={styles.quoteContainer}>
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            style={styles.quoteScrollView}
          >
            {educationalQuotes.map((quote) => (
              <View style={[styles.quoteWrapper, { width: width - 40 }]} key={quote.id}>
                <QuoteCard quote={quote.quote} author={quote.author} />
              </View>
            ))}
          </Animated.ScrollView>
          <View style={styles.paginationDots}>
            {educationalQuotes.map((_, i) => {
              const inputRange = [(i - 1) * (width - 40), i * (width - 40), (i + 1) * (width - 40)];
              
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
                extrapolate: 'clamp',
              });
              
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              
              return (
                <Animated.View
                  style={[styles.dot, { width: dotWidth, opacity }]}
                  key={i.toString()}
                />
              );
            })}
          </View>
        </View>

        {/* Navigation Cards */}
        <Text style={styles.sectionTitle}>Mindfulness Tools</Text>
        <View style={styles.navContainer}>
          <NavigationCard
            title="Breathing Exercise"
            icon={<MaterialIcons name="self-improvement" size={24} color="#FFF" />}
            colors={['#78A6FF', '#5B8DEF']}
            onPress={() => navigation.navigate('BreathingExercise')}
          />
          <NavigationCard
            title="Pomodoro Timer"
            icon={<MaterialIcons name="timer" size={24} color="#FFF" />}
            colors={['#FF9F7C', '#FF8A65']}
            onPress={() => navigation.navigate('Pomodoro')}
          />
        </View>

        {/* Todo List */}
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFC']}
          style={styles.todoSection}
        >
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={styles.todoInputContainer}>
            <TextInput
              style={styles.todoInput}
              placeholder="Add a new task..."
              value={todoText}
              onChangeText={setTodoText}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity style={styles.addButton} onPress={addTodo}>
              <LinearGradient
                colors={['#78D97C', '#4CAF50']}
                style={styles.addButtonGradient}
              >
                <AntDesign name="plus" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.todoList}>
            {todos.map(todo => (
              <TodoItem 
                key={todo.id} 
                item={todo} 
                onToggleComplete={toggleTodoComplete}
                onDelete={deleteTodo}
              />
            ))}
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 12,
    color: '#FF5252',
    marginLeft: 4,
    fontWeight: '500',
  },
  userDetails: {
    fontSize: 13,
    color: '#4A5568',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4299E1',
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  quoteContainer: {
    marginBottom: 16,
  },
  quoteScrollView: {
    paddingLeft: 16,
  },
  quoteWrapper: {
    paddingRight: 16,
  },
  quoteCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  quoteText: {
    fontSize: 14,
    color: '#2D3748',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 13,
    color: '#4A5568',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4299E1',
    marginHorizontal: 3,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navCard: {
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
  },
  navCardGradient: {
    padding: 12,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  navText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  todoSection: {
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  todoInputContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  todoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoList: {
    marginTop: 6,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  todoText: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748',
    marginLeft: 10,
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },
});

export default Dashboard;