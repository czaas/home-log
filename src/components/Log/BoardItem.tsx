import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { ILogItem } from "../../App";
import { Heading, Text } from "@mbkit/typography";
import { Card } from "@mbkit/card";
import { Button } from "@mbkit/button";
import "./Log.scss";
import { IconEdit, IconPhoto, IconListInactive } from "@mbkit/icon";

interface IBoardItem {
  item: ILogItem;
  i: number;
  editLogItem: (logId: string) => void;
}
export function BoardItem(props: IBoardItem) {
  const { item, i, editLogItem } = props;
  const { title, log, id, files, list } = item;
  return (
    <Draggable draggableId={id} index={i}>
      {provided => (
        <Card
          className="board__item"
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          type="item"
        >
          <Button onClick={() => editLogItem(id)} variant="icon">
            <IconEdit aria-label="Edit" />
          </Button>
          <Heading as="h3">{title}</Heading>
          <pre>
            <Text as="p">{log}</Text>
          </pre>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            {files.length > 0 && (
              <Text
                as="span"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 8
                }}
              >
                <IconPhoto aria-label="Photos" width={22} /> {files.length}
              </Text>
            )}
            {list.length > 0 && (
              <Text as="span" style={{ display: "flex", alignItems: "center" }}>
                <IconListInactive aria-label="List items" width={22} />{" "}
                {list.length}
              </Text>
            )}
          </div>
        </Card>
      )}
    </Draggable>
  );
}
