import React from 'react';
import classNames from 'classnames';

interface Props {
  error: string | null;
  onClose: () => void;
}

export const ErrorNotification: React.FC<Props> = ({ error, onClose }) => {
  return (
    <div
      className={classNames(
        'notification is-danger is-light has-text-weight-bold',
        { hidden: !error },
      )}
      data-cy="ErrorNotification"
    >
      <button
        aria-label="delete notification"
        className="delete"
        data-cy="HideErrorButton"
        onClick={onClose}
        type="button"
      />
      {error}
    </div>
  );
};
