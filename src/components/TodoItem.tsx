import React from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';
import { TodoDeleteButton } from './TodoDeleteButton';

interface Props {
  todo: Todo;
  isLoading: boolean;
  onDelete: () => void;
}

export const TodoItem: React.FC<Props> = ({ todo, isLoading, onDelete }) => {
  return (
    <div
      className={classNames('todo', { completed: todo.completed })}
      data-cy="Todo"
    >
      <label className="todo__status-label">
        <input
          checked={todo.completed}
          className="todo__status"
          data-cy="TodoStatus"
          readOnly
          type="checkbox"
        />
      </label>

      <span
        className="todo__title"
        data-cy="TodoTitle"
      >
        {todo.title}
      </span>

      <TodoDeleteButton onDelete={onDelete} />

      <div
        className={classNames('modal', { 'is-active': isLoading })}
        data-cy="TodoLoader"
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
