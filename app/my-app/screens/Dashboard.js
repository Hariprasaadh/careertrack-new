import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '../supabase/config';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const QuoteCard = ({ quote, author }) => {
  return (
    <LinearGradient
      colors={['#F8FBFF', '#EAF2FF']}
      style={styles.quoteCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.quoteText}>"{quote}"</Text>
      <Text style={styles.quoteAuthor}>- {author}</Text>
    </LinearGradient>
  );
};

const NavigationCard = ({ title, icon, colors, onPress }) => (
  <TouchableOpacity style={styles.navCard} onPress={onPress}>
    <LinearGradient
      colors={colors}
      style={styles.navCardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.navIconContainer}>{icon}</View>
      <Text style={styles.navText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const TodoItem = ({ item, onToggleComplete, onDelete }) => (
  <View style={styles.todoItem}>
    <TouchableOpacity onPress={() => onToggleComplete(item.id)}>
      {item.completed ? 
        <AntDesign name="checkcircle" size={20} color="#4CAF50" /> : 
        <Feather name="circle" size={20} color="#888" />
      }
    </TouchableOpacity>
    <View style={styles.todoContent}>
      <Text style={[styles.todoText, item.completed && styles.todoCompleted]}>
        {item.text}
      </Text>
      <Text style={styles.dateText}>
        Created: {format(new Date(item.created_at), 'MMM dd, yyyy - h:mm a')}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(item.id)}>
      <Feather name="trash-2" size={20} color="#FF5252" />
    </TouchableOpacity>
  </View>
);

const Dashboard = ({ navigation }) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  
  const [scrollX] = useState(new Animated.Value(0));
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const profileImageUrl = user?.imageUrl || user?.profileImageUrl;
  const username = user?.fullName || user?.username || 'Student';
  const userId = user?.id;

  const fetchTodos = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchTodos();

    const subscription = supabase
      .channel('todos-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          switch(payload.eventType) {
            case 'INSERT':
              setTodos(prev => [payload.new, ...prev]);
              break;
            case 'UPDATE':
              setTodos(prev => prev.map(todo => 
                todo.id === payload.new.id ? payload.new : todo
              ));
              break;
            case 'DELETE':
              setTodos(prev => prev.filter(todo => 
                todo.id !== payload.old.id
              ));
              break;
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [fetchTodos, userId]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const addTodo = async () => {
    if (!todoText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .insert({
          text: todoText,
          completed: false,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      setTodoText('');
    } catch (error) {
      Alert.alert("Error", "Failed to add task");
    }
  };

  const toggleTodoComplete = async (id) => {
    try {
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todos.find(t => t.id === id).completed })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
      Alert.alert("Error", "Failed to update task");
    }
  };

  const deleteTodo = async (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure?",
      [
        { text: "Cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);
              
              if (error) throw error;
            } catch (error) {
              Alert.alert("Error", "Failed to delete task");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F9FAFC']} style={styles.gradientBackground}>
      <ScrollView style={styles.container}>
        {/* User Profile Section */}
        <LinearGradient colors={['#F0F7FF', '#E6F0FF']} style={styles.profileSection}>
          <Image 
            source={{ uri: profileImageUrl }} 
            style={styles.profileImage} 
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.profileInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.userName}>{username}</Text>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color="#FF5252" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userDetails}>Student • Focus Level: Pro</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{todos.length}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {todos.filter(todo => todo.completed).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Todo List Section */}
        <LinearGradient colors={['#FFFFFF', '#F9FAFC']} style={styles.todoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={fetchTodos} style={styles.refreshButton}>
              <Feather name="refresh-cw" size={18} color="#4299E1" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.todoInputContainer}>
            <TextInput
              style={styles.todoInput}
              placeholder="Add a new task..."
              value={todoText}
              onChangeText={setTodoText}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity style={styles.addButton} onPress={addTodo}>
              <LinearGradient colors={['#78D97C', '#4CAF50']} style={styles.addButtonGradient}>
                <AntDesign name="plus" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.todoList}>
            {loading ? (
              <Text style={styles.loadingText}>Loading tasks...</Text>
            ) : todos.length === 0 ? (
              <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
            ) : (
              todos.map(todo => (
                <TodoItem 
                  key={todo.id} 
                  item={todo} 
                  onToggleComplete={toggleTodoComplete}
                  onDelete={deleteTodo}
                />
              ))
            )}
          </View>
        </LinearGradient>

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
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1 },
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
  profileInfo: { marginLeft: 12, flex: 1 },
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
  statItem: { alignItems: 'center', flex: 1 },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  refreshButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginVertical: 10,
  },
  todoSection: {
    borderRadius: 12,
    margin: 12,
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
    marginBottom: 8,
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
  todoList: { marginTop: 6 },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  todoContent: { flex: 1, marginLeft: 10 },
  todoText: {
    fontSize: 13,
    color: '#2D3748',
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },
  dateText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  loadingText: {
    textAlign: 'center',
    color: '#718096',
    padding: 20,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    padding: 20,
    fontSize: 14,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  navCardGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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
});

export default Dashboard;