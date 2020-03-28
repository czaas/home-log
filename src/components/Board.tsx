import React, { useContext, useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { RouteComponentProps } from "@reach/router";
import { Button } from "@mbkit/button";
import { Heading, Text } from "@mbkit/typography";
import { BoardItem } from "./Log/BoardItem";
import { AppContext, IColumn, ILogItem } from "../App";
import { Modal } from "@mbkit/modal";
import { Input } from "@mbkit/input";
import { GlyphOther, IconAdd } from "@mbkit/icon";
import nanoid from "nanoid";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { Dialog } from "@mbkit/dialog";
import { EditLogItemModal } from "./Log/EditLogItem";
import "./Log/Log.scss";

interface BoardProps extends RouteComponentProps {}

export function Board(props: BoardProps) {
  const {
    columns = [],
    logItems = [],
    setLogItems,
    setColumns,
    handleAddDefaultData
  } = useContext(AppContext);

  function onDragEnd(result) {
    const { source, destination, draggableId, type } = result;
    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "column") {
      const changedColumn = columns.find(col => col.id === draggableId);

      if (!changedColumn) {
        return;
      }

      const otherColumns = columns
        .filter(col => col.id !== draggableId)
        .sort((a, b) => a.order - b.order)
        .map((col, i) => ({ ...col, order: i }));
      let found = false;

      const updatedColumns = otherColumns.map((col, i) => {
        if (col.order === destination.index) {
          found = true;
        }
        if (found) {
          return {
            ...col,
            order: i + 1
          };
        }
        return {
          ...col
        };
      });
      setColumns([
        ...updatedColumns,
        { ...changedColumn, order: destination.index }
      ]);

      return;
    }

    if (source.droppableId === destination.droppableId) {
      const updatedItems = reorderLogItems(logItems, columns, result);
      setLogItems(updatedItems);
      return;
    }

    // remove item from source column and add to destination column
    const updatedColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          logIds: col.logIds.filter(id => id !== draggableId)
        };
      }
      if (col.id === destination.droppableId) {
        return {
          ...col,
          logIds: [...col.logIds, draggableId]
        };
      }
      return col;
    });

    const updatedItems = reorderLogItems(logItems, updatedColumns, result);
    setColumns(updatedColumns);
    setLogItems(updatedItems);
  }

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState<{
    id: string | null;
    value: string;
  }>({
    id: null,
    value: ""
  });
  const newColumnNameRef = useRef<HTMLInputElement>(null);

  function handleAddColumn(e) {
    e.preventDefault();
    if (newColumnName.value.trim()) {
      const newColumn = {
        name: newColumnName.value,
        logIds: [],
        id: `column-${nanoid()}`,
        order: columns.length
      };

      if (newColumnName.id) {
        const updatedColumns = columns.map(col => {
          if (col.id === newColumnName.id) {
            return {
              ...col,
              name: newColumnName.value
            };
          }
          return col;
        });
        setColumns(updatedColumns);
      } else {
        setColumns([...columns, newColumn]);
      }
      setShowAddColumn(false);
    }
  }
  useEffect(() => {
    if (!showAddColumn) {
      setNewColumnName({
        id: null,
        value: ""
      });
    }
  }, [showAddColumn]);

  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);
  function handleDeleteColumn(columnId) {
    const column = columns.find(col => col.id === columnId);

    if (column && column.logIds.length === 0) {
      setColumns(columns.filter(col => col.id !== columnId));
      return;
    }

    setShowCannotDeleteDialog(true);
  }
  const sortedColumns = columns.sort((a, b) => a.order - b.order);

  const [logBeingEdited, setLogBeingEdited] = useState<null | string>(null);
  function handleAddNewLogItem(columnId) {
    const column = columns.find(col => columnId === col.id);

    if (!column) {
      return;
    }

    const newLogItemId = nanoid();
    setLogItems([
      ...logItems,
      {
        title: "",
        log: "",
        files: [],
        id: newLogItemId,
        order: column.logIds.length,
        list: []
      }
    ]);
    setColumns(
      columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            logIds: [...col.logIds, newLogItemId]
          };
        }
        return col;
      })
    );
    setLogBeingEdited(newLogItemId);
  }
  return (
    <div style={{ background: "#fff" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div>
          <Button variant="secondary" onClick={() => setShowAddColumn(true)}>
            Add Column
          </Button>
          <Button variant="secondaryOutlined" onClick={handleAddDefaultData}>
            Add Default Data
          </Button>
        </div>
        <Droppable droppableId={"col"} type="column" direction="horizontal">
          {providedColumn => (
            <div
              {...providedColumn.droppableProps}
              ref={providedColumn.innerRef}
              className={"board"}
            >
              {sortedColumns.map((column, columnIndex) => {
                const items = logItems
                  .filter(item => column.logIds.includes(item.id))
                  .sort((a, b) => a.order - b.order);
                return (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={columnIndex}
                  >
                    {colProvided => (
                      <>
                        {/* 
                      // @ts-ignore */}
                        <div
                          className={`board__column`}
                          type="column"
                          ref={colProvided.innerRef}
                          {...colProvided.dragHandleProps}
                          {...colProvided.draggableProps}
                        >
                          <div>
                            {items.length}
                            <Heading as="h2">{column.name}</Heading>
                            <Button
                              variant="icon"
                              onClick={() => handleAddNewLogItem(column.id)}
                            >
                              <IconAdd
                                width={24}
                                height={24}
                                aria-label="Add log item"
                              />
                            </Button>
                            <Menu>
                              <MenuButton>
                                <GlyphOther aria-label="Column Options" />
                              </MenuButton>
                              <MenuList>
                                <MenuItem
                                  onSelect={() => {
                                    setNewColumnName({
                                      value: column.name,
                                      id: column.id
                                    });
                                    setShowAddColumn(true);
                                  }}
                                >
                                  Edit Name
                                </MenuItem>
                                <MenuItem
                                  onSelect={() => handleDeleteColumn(column.id)}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </div>

                          <Droppable droppableId={column.id} type="item">
                            {provided => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="board__column__drop"
                              >
                                {items.map((item, i) => (
                                  <BoardItem
                                    editLogItem={setLogBeingEdited}
                                    item={item}
                                    i={i}
                                    key={item.id}
                                  />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </>
                    )}
                  </Draggable>
                );
              })}
              {providedColumn.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Modal
        initialFocusRef={newColumnNameRef}
        label={`${newColumnName.id ? "Edit" : "Add"} new column`}
        show={showAddColumn}
        onClose={() => setShowAddColumn(false)}
        size={3}
      >
        <form onSubmit={handleAddColumn}>
          <Input
            ref={newColumnNameRef}
            value={newColumnName.value}
            onChange={e =>
              setNewColumnName({ value: e.target.value, id: newColumnName.id })
            }
          />
          <Button
            type="button"
            onClick={() => setShowAddColumn(false)}
            variant="simpleText"
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {newColumnName.id ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>

      <EditLogItemModal
        logId={logBeingEdited || ""}
        close={() => setLogBeingEdited(null)}
      />
      <Dialog
        header="Move logs before deleting"
        show={showCannotDeleteDialog}
        onClose={() => setShowCannotDeleteDialog(false)}
      >
        <Text>
          Please delete the log items or move them to a different column before
          deleting this column
        </Text>
      </Dialog>
    </div>
  );
}

function reorderLogItems(
  logItems: ILogItem[],
  columns: IColumn[],
  dragResult
): ILogItem[] {
  const { destination, draggableId } = dragResult;
  // all we need to do is update the single list of items
  const affectedColumn = columns.find(c => c.id === destination.droppableId);
  if (!affectedColumn) {
    return [];
  }
  const itemsWithoutChangedItem = logItems.filter(
    item => item.id !== draggableId
  );
  const changedItem = logItems.find(item => item.id === draggableId);

  if (!changedItem) {
    return logItems;
  }
  // saving to spread later
  const unaffectedItems = itemsWithoutChangedItem.filter(
    item => !affectedColumn.logIds.includes(item.id)
  );

  // need to reorder these items
  const affectedItems = itemsWithoutChangedItem
    .filter(item => affectedColumn.logIds.includes(item.id))
    .sort((a, b) => a.order - b.order)
    .map((item, i) => ({ ...item, order: i }));

  let found = false;

  const updatedItems = affectedItems.map((item, i) => {
    if (item.order === destination.index) {
      found = true;
    }

    if (found) {
      return {
        ...item,
        order: i + 1
      };
    }

    return {
      ...item
    };
  });

  return [
    ...unaffectedItems,
    ...updatedItems,
    { ...changedItem, order: destination.index }
  ];
}
