/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState, useRef } from 'react';
import { UserWarning } from './UserWarning';
import {
  ErrorNotification,
  Filter,
  FilterType,
  Footer,
  NewTodoField,
  TodoList,
} from './components';
import { Todo, User } from './types/Todo';
import {
  createTodo,
  deleteTodo,
  getTodos,
} from './api/todosApi';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  // Load todos on mount or when user changes
  useEffect(() => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    getTodos(user.id)
      .then(setTodos)
      .catch(() => {
        setError('Unable to load todos');
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  if (!user) {
    return <UserWarning />;
  }

  const visibleTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  // Only show tempTodo if it matches current filter
  const visibleTempTodo = tempTodo && (
    (filter === 'all') ||
    (filter === 'active' && !tempTodo.completed) ||
    (filter === 'completed' && tempTodo.completed)
  ) ? tempTodo : null;

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  const handleAddTodo = async (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title should not be empty');
      return;
    }

    setError(null);
    setIsAddingTodo(true);

    const newTodoData = {
      userId: user.id,
      title: trimmedTitle,
      completed: false,
    };

    // Create temp todo
    setTempTodo({
      id: 0,
      ...newTodoData,
    });

    try {
      const createdTodo = await createTodo(newTodoData);
      setTodos([...todos, createdTodo]);
      setNewTodoTitle('');
    } catch {
      setError('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setIsAddingTodo(false);
      
      // Focus input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setError(null);
    setProcessingIds([...processingIds, id]);

    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setProcessingIds(processingIds.filter(processId => processId !== id));
      
      // Focus input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    setError(null);

    let hasError = false;

    const deletionPromises = completedTodos.map(todo =>
      deleteTodo(todo.id)
        .then(() => {
          setTodos(prev => prev.filter(t => t.id !== todo.id));
        })
        .catch(() => {
          hasError = true;
        }),
    );

    try {
      await Promise.all(deletionPromises);
      
      if (hasError) {
        setError('Unable to delete a todo');
      }
    } catch {
      setError('Unable to delete a todo');
    } finally {
      // Focus input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="todoapp">
      <header className="todoapp__header">
        <h1 className="todoapp__title">todos</h1>
        <NewTodoField
          inputRef={inputRef}
          isLoading={isAddingTodo}
          value={newTodoTitle}
          onChange={setNewTodoTitle}
          onSubmit={handleAddTodo}
        />
      </header>

      {(todos.length > 0 || isLoading) && (
        <div className="todoapp__content">
          <TodoList
            todos={visibleTodos}
            tempTodo={visibleTempTodo}
            processingIds={processingIds}
            onDeleteTodo={handleDeleteTodo}
          />

          {todos.length > 0 && (
            <Footer
              activeCount={activeCount}
              completedCount={completedCount}
              selectedFilter={filter}
              onFilterChange={setFilter}
              onClearCompleted={handleClearCompleted}
            />
          )}
        </div>
      )}

      <ErrorNotification
        error={error}
        onClose={() => setError(null)}
      />
    </div>
  );
};
