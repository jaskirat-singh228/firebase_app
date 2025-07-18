import SQLite, {
  SQLError,
  SQLiteDatabase,
  Transaction,
} from 'react-native-sqlite-storage';
import {TTodoData} from 'screens/todos';

SQLite.enablePromise(false);

const tableName = 'todos';

const db: SQLiteDatabase = SQLite.openDatabase(
  {name: 'todos.db', location: 'default'},
  () => console.log('Database opened'),
  (err: SQLError) => console.error('SQL Error: ', err),
);

// Initialize DB once
const createTable = () => {
  db.transaction((tx: Transaction) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        todoId NVARCHAR(255) PRIMARY KEY,
        todo TEXT NOT NULL,
        createdAt DATETIME NOT NULL,
        isSynced BOOLEAN NOT NULL
      );`,
      [],
      () => console.log('Table initialized'),
      (_, err: SQLError) => {
        console.error('Error initializing table:', err);
      },
    );
  });
};

createTable(); // Call once when importing

const addOfflineTodo = async (todo: TTodoData) => {
  const query = `INSERT INTO ${tableName} (todoId, todo, createdAt, isSynced)
  VALUES (?, ?, ?, ?)`;

  const params = [
    todo.todoId,
    todo.todo,
    todo.createdAt, // Should be a number (timestamp) or ISO string
    todo.isSynced ? true : false, // Convert boolean to 1 or 0
  ];

  // Then use it like:
  db.transaction(tx => {
    tx.executeSql(
      query,
      params,
      () => console.log('Insert successful'),
      (tx, error) => {
        console.error('Insert failed', error);
      },
    );
  });
  // return new Promise((resolve, reject) => {
  //   db.transaction((tx: Transaction) => {
  //     tx.executeSql(
  //       `DELETE FROM ${tableName} WHERE todoId = ?;`,
  //       [todo.todoId],
  //       () => {
  //         tx.executeSql(
  //           `INSERT INTO ${tableName} (todoId, todo,   createdAt,  isSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  //           [todo.todoId, todo.todo, todo.createdAt, todo.isSynced],
  //           () =>
  //             resolve({
  //               message: 'Todo saved in local successfully!',
  //               data: todo,
  //             }),
  //           (_, err: SQLError) => reject(err),
  //         );
  //       },
  //       (_, err: SQLError) => reject(err),
  //     );
  //   });
  // });
};

const addOfflineTodos = (todos: TTodoData[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: Transaction) => {
        todos.forEach(todo => {
          tx.executeSql(
            `INSERT OR REPLACE INTO ${tableName} (todoId, todo, createdAt,  isSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [todo.todoId, todo.todo, todo.createdAt, todo.isSynced ?? true],
            () => {},
            (_, err: SQLError) => reject(err),
          );
        });
      },
      (err: SQLError) => reject(err),
      () => resolve(),
    );
  });
};

const deleteLocalTodo = (todoId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `DELETE FROM ${tableName} WHERE todoId = ?;`,
        [todoId],
        (_: any, result: any) => resolve(result),
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const editData = (todoId: string, todo: Partial<TTodoData>): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `UPDATE ${tableName}
         SET todo = ?,
         WHERE todoId = ?;`,
        [todo.todo, todoId],
        (_: any, result: any) => resolve(result),
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const getTodos = (): Promise<{message: string; data: TTodoData[]}> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT * FROM ${tableName} ORDER BY createdAt DESC;`,
        [],
        (_: any, results: any) => {
          const todos: TTodoData[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            todos.push(results.rows.item(i));
          }
          resolve({
            message: `Retrieved ${todos.length} todos successfully!`,
            data: todos,
          });
        },
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const getUnsyncedTodos = (): Promise<TTodoData[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT * FROM ${tableName} WHERE isSynced = false;`,
        [],
        (_: any, results: any) => {
          const todos: TTodoData[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            todos.push(results.rows.item(i));
          }
          resolve(todos);
        },
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const updateRowValue = (
  newValue: number,
  todoId: string,
): Promise<{message: string}> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `UPDATE ${tableName} SET isSynced = ? WHERE todoId = ?;`,
        [newValue, todoId],
        () => resolve({message: `Todo with ID ${todoId} synced successfully`}),
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const clearAllTodos = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `DELETE FROM ${tableName};`,
        [],
        () => resolve(),
        (_, err: SQLError) => reject(err),
      );
    });
  });
};

const TodoLocalRepository = {
  addOfflineTodo,
  addOfflineTodos,
  deleteLocalTodo,
  editData,
  getTodos,
  getUnsyncedTodos,
  updateRowValue,
  clearAllTodos,
};

export default TodoLocalRepository;
