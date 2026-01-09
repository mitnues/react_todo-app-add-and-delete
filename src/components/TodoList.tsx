import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  processingIds: number[];
  onDeleteTodo: (id: number) => void;
}

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  processingIds,
  onDeleteTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          isLoading={processingIds.includes(todo.id)}
          todo={todo}
          onDelete={() => onDeleteTodo(todo.id)}
        />
      ))}

      {tempTodo && <TodoItem isLoading todo={tempTodo} onDelete={() => {}} />}
    </section>
  );
};
