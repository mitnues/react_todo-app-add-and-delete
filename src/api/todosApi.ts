import { Todo } from '../types/Todo';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const getTodos = (userId: number): Promise<Todo[]> => {
  return fetch(`${BASE_URL}/todos?userId=${userId}`).then(response => {
    if (!response.ok) {
      throw new Error('Failed to load todos');
    }

    return response.json();
  });
};

export const createTodo = (todo: Omit<Todo, 'id'>): Promise<Todo> => {
  return fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }

    return response.json();
  });
};

export const deleteTodo = (id: number): Promise<void> => {
  return fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  });
};

export const updateTodo = (
  id: number,
  data: Partial<Omit<Todo, 'id'>>,
): Promise<Todo> => {
  return fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    return response.json();
  });
};
