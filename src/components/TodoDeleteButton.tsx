import React from 'react';

interface Props {
  onDelete: () => void;
}

export const TodoDeleteButton: React.FC<Props> = ({ onDelete }) => {
  return (
    <button
      aria-label="Delete todo"
      className="button is-delete is-loading"
      data-cy="TodoDelete"
      onClick={onDelete}
      type="button"
    />
  );
};
