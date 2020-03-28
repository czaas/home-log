import React, { useContext, useEffect, useState } from "react";
import { AppContext, ILogItem } from "../../App";
import { Modal } from "@mbkit/modal";
import { Input } from "@mbkit/input";
import { Button } from "@mbkit/button";
import { Textarea } from "@mbkit/textarea";
import { Label } from "@mbkit/label";
import { Photos } from "./Photos";
import { FileObj } from "../Log";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPane
} from "@mbkit/accordion";
import nanoid from "nanoid";
import { Checkbox } from "@mbkit/checkbox";

interface EditLogItemProps {
  logId: string;
  close: () => void;
}
export function EditLogItemModal(props: EditLogItemProps) {
  const { logId, close } = props;
  const { logItems, setLogItems, columns, setColumns } = useContext(AppContext);
  const logItem = logItems.find(item => item.id === logId);
  const [draft, setDraft] = useState<ILogItem | undefined>(logItem);
  const [activePane, setActivePane] = useState<number[]>([]);

  useEffect(() => {
    if (!logId) {
      setActivePane([]);
    }
  }, [logId]);
  useEffect(() => {
    setDraft(logItem ? logItem : undefined);
  }, [logItem]);

  function updateLogItem() {
    const updatedLogItems = logItems.map(item => {
      if (item.id === logId && draft) {
        return {
          ...draft
        };
      }
      return item;
    });

    setLogItems(updatedLogItems);
    close();
  }

  function handleClose() {
    if (
      logItem &&
      logItem.title.trim() === "" &&
      logItem.log.trim() === "" &&
      logItem.files.length === 0 &&
      logItem.list.length === 0
    ) {
      handleDelete();
      return;
    }
    close();
  }

  function handleDelete() {
    const updatedLogItems = logItems.filter(item => item.id !== logId);
    const updatedColumns = columns.map(col => {
      return {
        ...col,
        logIds: col.logIds.filter(id => id !== logId)
      };
    });
    setLogItems(updatedLogItems);
    setColumns(updatedColumns);
    close();
  }

  function handleFileChange(files: FileObj[]) {
    if (draft) {
      setDraft({ ...draft, files: files });
    }
  }

  function handleActivePane(indexChanged: number) {
    if (indexChanged === activePane[0]) {
      setActivePane([]);
      return;
    }
    setActivePane([indexChanged]);
  }

  const [listItem, setListItem] = useState("");
  function handleAddNewListItem() {
    if (listItem.trim() !== "" && draft) {
      setDraft({
        ...draft,
        list: [
          ...draft.list,
          { id: nanoid(), value: listItem, completed: false }
        ]
      });
      setListItem("");
    }
  }
  function handleListItemChecked(completed, id) {
    if (draft) {
      setDraft({
        ...draft,
        list: draft.list.map(item => {
          if (item.id === id) {
            return {
              ...item,
              completed
            };
          }
          return item;
        })
      });
    }
  }

  // TODO add delete list item add edit list item

  const { title = "", log = "", files = [], list = [] } = draft || {};
  return (
    <Modal
      header={`${
        logItem && (logItem.title || logItem.log) ? "Edit" : "Create"
      } log item`}
      footer={
        <>
          <Button variant="tertiaryOutlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateLogItem}>
            Save
          </Button>
        </>
      }
      label={"Edit log item"}
      size={3}
      show={logId ? true : false}
      onClose={handleClose}
    >
      <div style={{ padding: 16, display: "grid", gridGap: 8 }}>
        <Label>
          Title
          <Input
            value={title}
            onChange={e =>
              draft && setDraft({ ...draft, title: e.target.value })
            }
            disabled={!draft}
          />
        </Label>
        <Label>
          Log
          <Textarea
            value={log}
            onChange={e => draft && setDraft({ ...draft, log: e.target.value })}
          />
        </Label>

        <Accordion activePanes={activePane} onChange={handleActivePane}>
          <AccordionItem>
            <AccordionHeader>Photos ({files.length})</AccordionHeader>
            <AccordionPane style={{ overflow: "auto" }}>
              <div style={{ maxWidth: "368px" }}>
                <Photos files={files} setFiles={handleFileChange} />
              </div>
            </AccordionPane>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>List Items</AccordionHeader>
            <AccordionPane>
              <Input
                value={listItem}
                onChange={e => setListItem(e.target.value)}
              />
              <Button
                variant="secondaryOutlined"
                onClick={handleAddNewListItem}
              >
                Add
              </Button>
              <ul>
                {list.map(item => (
                  <li key={item.id}>
                    <label>
                      <Checkbox
                        checked={item.completed}
                        onChange={e =>
                          handleListItemChecked(!item.completed, item.id)
                        }
                      />{" "}
                      {item.value}
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionPane>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>Actions</AccordionHeader>
            <AccordionPane>
              <Button
                variant="simpleText"
                style={{ color: "red" }}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </AccordionPane>
          </AccordionItem>
        </Accordion>
      </div>
    </Modal>
  );
}
