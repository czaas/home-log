import React, { useState, useEffect } from "react";
import { Router, Link, RouteComponentProps } from "@reach/router";
import { Log, FileObj } from "./components/Log";
import { Board } from "./components/Board";
import Cookie from "js-cookie";
import "./styles.scss";

export interface IListItem {
  value: string;
  id: string;
  completed: boolean;
}
export interface ILogItem {
  title: string;
  log: string;
  files: FileObj[];
  id: string;
  order: number;
  list: IListItem[];
}
export interface IColumn {
  name: string;
  id: string;
  logIds: string[];
  order: number;
}

interface AppContextValues {
  logItems: ILogItem[];
  setLogItems: (logItems: ILogItem[]) => void;
  columns: IColumn[];
  setColumns: (columns: IColumn[]) => void;
  handleAddDefaultData: () => void;
}
export const AppContext = React.createContext<AppContextValues>({
  logItems: [],
  setLogItems: () => {},
  columns: [],
  setColumns: () => {},
  handleAddDefaultData: () => {}
});

const initialLogItems = [
  {
    title: "testSuper man",
    log: "fdjkslafjdklsajfdlks",
    files: [],
    id: "test4",
    order: 0,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "something all together",
    log: "Blah blah blah",
    files: [],
    id: "test5",
    order: 1,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "test",
    log: "test",
    files: [],
    id: "test1",
    order: 2,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "another",
    log: "why not",
    files: [],
    id: "test2",
    order: 1,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "Third item",
    log: "Another fresh test",
    files: [],
    id: "test3",
    order: 0,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "sadfd item",
    log: "Another fresh test",
    files: [],
    id: "test10",
    order: 3,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "zccx item",
    log: "Another fresh test",
    files: [],
    id: "test11",
    order: 4,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  },
  {
    title: "wer item",
    log: "Another fresh test",
    files: [],
    id: "test12",
    order: 5,
    list: [{ value: "Number 1!", completed: false, id: "1" }]
  }
];
const initialColumns = [
  {
    name: "Default",
    order: 0,
    id: "column-1test",
    logIds: ["test1", "test2", "test3", "test10"]
  },
  {
    name: "Another",
    order: 2,
    id: "column-3test",
    logIds: ["test11", "test12"]
  },
  {
    name: "Test",
    order: 1,
    id: "column-2test",
    logIds: ["test4", "test5"]
  }
];

export default function App() {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [logItems, setLogItems] = useState<ILogItem[]>([]);
  // Initial check of getting columns and items
  useEffect(() => {
    const cols: IColumn[] = Cookie.getJSON("columns");
    const logs: ILogItem[] = Cookie.getJSON("logs");
    if (cols) {
      setColumns(cols);
    }
    if (logs) {
      setLogItems(logs);
    }
  }, []);

  useEffect(() => {
    Cookie.set("columns", columns);
    Cookie.set("logs", logItems);
  }, [columns, logItems]);

  function handleAddDefaultData() {
    setColumns(initialColumns);
    setLogItems(initialLogItems);
  }
  return (
    <AppContext.Provider
      value={{
        logItems,
        setLogItems,
        columns,
        setColumns,
        handleAddDefaultData
      }}
    >
      <ul className="nav">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/timeline">Timeline</Link>
        </li>
        <li>
          <Link to="/log">Log</Link>
        </li>
        <li>
          <Link to="/log-item">Log Item</Link>
        </li>
      </ul>
      <Router>
        <Home path="/" />
        <Board path="/log" />
        <Log path="/log-item" />
        <NotFound path="*" />
      </Router>
    </AppContext.Provider>
  );
}

interface HomeProps extends RouteComponentProps {}
function Home(props: HomeProps) {
  return (
    <p>
      Welcome to your dashbaord. Add or update home improvements on your{" "}
      <Link to="/log">log</Link> or view your{" "}
      <Link to="/timeline">timeline</Link>.
    </p>
  );
}

interface NotFoundProps extends RouteComponentProps {}
function NotFound(props: NotFoundProps) {
  return <p>Sorry, we could not find what you were looking for</p>;
}
