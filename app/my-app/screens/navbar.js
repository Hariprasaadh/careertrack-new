import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Color constants for maintainability
const COLORS = {
  active: '#e53e3e', // More accessible red color
  inactive: '#718096',
  background: '#ffffff',
  tabActiveBg: '#fff5f5',
  shadow: '#000',
  border: '#e2e8f0',
};

const TABS = [
  { 
    name: 'Home', 
    label: 'Home' 
  },
  { 
    name: 'Todo', 
    label: 'Todo' 
  },
  { 
    name: 'Bookmark', 
    label: 'Saved' 
  },
  { 
    name: 'Profile', 
    label: 'Profile' 
  },
];

const TabButton = React.memo(({ name, label, activeTab, onPress }) => {
  const isActive = activeTab === name;
  
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      testID={`tab-${name.toLowerCase()}`}
    >
      <Text 
        style={[styles.label, { color: isActive ? COLORS.active : COLORS.inactive }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const TodoPage = () => {
  const [todos, setTodos] = useState([
    { id: 1, title: 'Complete React Native project', completed: false },
    { id: 2, title: 'Learn Redux', completed: true },
    { id: 3, title: 'Update portfolio website', completed: false },
  ]);

  const toggleTodo = useCallback((id) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Todo List</Text>
      {todos.map(todo => (
        <TouchableOpacity 
          key={todo.id} 
          style={styles.todoItem}
          onPress={() => toggleTodo(todo.id)}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.todoText, 
              todo.completed && styles.completedTodo
            ]}
          >
            {todo.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const HomePage = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>Home</Text>
  </View>
);

const BookmarkPage = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>Saved Items</Text>
  </View>
);

const ProfilePage = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>My Profile</Text>
  </View>
);

const NavBar = () => {
  const [activeTab, setActiveTab] = useState('Home');
  
  const handleTabPress = useCallback((name) => {
    setActiveTab(name);
    // Add navigation logic here if using a navigation library
  }, []);

  const renderActivePage = useCallback(() => {
    switch(activeTab) {
      case 'Todo':
        return <TodoPage />;
      case 'Bookmark':
        return <BookmarkPage />;
      case 'Profile':
        return <ProfilePage />;
      case 'Home':
      default:
        return <HomePage />;
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {renderActivePage()}
      </View>
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.container}>
          {TABS.map(tab => (
            <TabButton
              key={tab.name}
              name={tab.name}
              label={tab.label}
              activeTab={activeTab}
              onPress={() => handleTabPress(tab.name)}
            />
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomSafeArea: {
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    // Shadow for iOS
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.tabActiveBg,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    maxWidth: 80,
  },
  pageContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  todoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});

export default NavBar;
