import React, { useEffect, useState, useRef } from 'react';
// import { UserWarning } from './UserWarning';
import {
  ErrorNotification,
  FilterType,
  Footer,
  NewTodoField,
  TodoList,
} from './components';
import { Todo } from './types/Todo';
import { createTodo, deleteTodo, updateTodo } from './api/todosApi';

export const App: React.FC = () => {
  // No user state, use fixed id
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // No user to load

  // Load todos on mount
  useEffect(() => {
    setIsLoading(false);
    setTodos([]); // Start with an empty list
  }, []);

  // Focus input after adding a todo
  useEffect(() => {
    if (!isAddingTodo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTodo]);

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(timer);
  }, [error]);

  // No login, always show todos

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
  const isActive = tempTodo && filter === 'active' && !tempTodo.completed;
  const isCompleted = tempTodo && filter === 'completed' && tempTodo.completed;

  const visibleTempTodo =
    tempTodo && (filter === 'all' || isActive || isCompleted) ? tempTodo : null;

  const completedCount = todos.filter(todo => todo.completed).length;
  // Não considerar tempTodo no contador enquanto está pendente
  const activeCount = todos.filter(todo => !todo.completed).length;

  const handleAddTodo = async (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title should not be empty');

      return;
    }

    setError(null);
    setIsAddingTodo(true);

    const newTodoData = {
      title: trimmedTitle,
      completed: false,
    };

    // Create temp todo
    setTempTodo({
      id: 0,
      ...newTodoData,
    });

    // Não limpar o input enquanto está aguardando resposta

    try {
      const createdTodo = await createTodo(newTodoData);
      // If API returns no id or duplicate id, generate a unique one
      let uniqueId = createdTodo.id;

      if (!uniqueId || todos.some(t => t.id === uniqueId)) {
        uniqueId = Math.max(0, ...todos.map(t => t.id)) + 1;
      }

      setTodos([...todos, { ...createdTodo, id: uniqueId }]);
      setNewTodoTitle(''); // Limpa só após sucesso
    } catch (err: any) {
      setError(err?.message || 'Unable to add a todo');
      // Não limpar o input em caso de erro
    } finally {
      setTempTodo(null);
      setIsAddingTodo(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setError(null);
    setProcessingIds(prev => [...prev, id]);

    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setProcessingIds(prev => prev.filter(processId => processId !== id));

      // Focus input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleToggleTodo = async (id: number) => {
    setError(null);
    setProcessingIds(prev => [...prev, id]);

    // Optimistic update using previous state
    let newCompletedValue: boolean | null = null;

    setTodos(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          newCompletedValue = !t.completed;

          return { ...t, completed: !t.completed };
        }

        return t;
      });

      return updated;
    });

    try {
      const newCompleted = newCompletedValue ?? true;

      await updateTodo(id, { completed: newCompleted });
    } catch {
      setError('Unable to update a todo');

      // Revert optimistic update
      setTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    } finally {
      setProcessingIds(prev => prev.filter(processId => processId !== id));

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setError(null);
    if (completedTodos.length === 0) {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      return;
    }

    setProcessingIds(prev => [...prev, ...completedTodos.map(t => t.id)]);
    try {
      const results = await Promise.all(
        completedTodos.map(todo =>
          deleteTodo(todo.id)
            .then(() => ({ id: todo.id, success: true }))
            .catch(() => ({ id: todo.id, success: false })),
        ),
      );
      const failed = results.filter(r => !r.success).map(r => r.id);
      const succeeded = results.filter(r => r.success).map(r => r.id);

      if (succeeded.length > 0) {
        setTodos(prev => prev.filter(t => !succeeded.includes(t.id)));
      }

      if (failed.length > 0) {
        setError('Unable to delete a todo');
      }
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setProcessingIds(prev =>
        prev.filter(id => !completedTodos.some(t => t.id === id)),
      );
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
            onToggleTodo={handleToggleTodo}
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

      <ErrorNotification error={error} onClose={() => setError(null)} />
    </div>
  );
};
