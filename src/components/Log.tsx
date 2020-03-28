import React, { useState, ChangeEvent, useEffect } from "react";
import { RouteComponentProps } from "@reach/router";
import "../styles.scss";
import { Card } from "@mbkit/card";
import { Input } from "@mbkit/input";
import { Button } from "@mbkit/button";
import { Label } from "@mbkit/label";
import { FileUploader } from "@mbkit/file-uploader";
import { Textarea } from "@mbkit/textarea";
import { Modal } from "@mbkit/modal";
import { Checkbox } from "@mbkit/checkbox";
import nanoid from "nanoid";

const logItemTemplate = {
  id: "",
  occurrenceTime: new Date(), // date to appear in feed
  title: "",
  log: "",
  photos: [
    {
      src: "",
      alt: "",
      displayInFeed: true,
      receipt: false
    }
  ],
  reminder: {
    // if it's repeat, and repeat occurs: this item is cloned for the feed
    on: false,
    frequency: "daily/biweekly/monthly/every {n} days",
    days: 45,
    timeInDay: new Date() // or morning/afternoon/night?
  }
};
console.log(logItemTemplate);

export type FileObj = {
  file: File;
  id: string;
  displayInFeed: boolean;
  receipt: boolean;
  dataUri: string;
};

interface LogProps extends RouteComponentProps {}

export function Log(props: LogProps) {
  const [title, setTitle] = useState("");
  const [log, setLog] = useState("");
  const [files, setFiles] = useState<FileObj[]>([]);

  useEffect(() => {
    const logItem = {
      title,
      log,
      files
    };
    console.log("save changes", logItem);
  }, [title, log, files]);

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const filesEvent = e.target.files;
    if (!filesEvent) {
      return;
    }
    // only collect png/jpeg
    const filesArr: FileObj[] = Array.from(filesEvent)
      .filter(file => file.type.includes("png") || file.type.includes("jpeg"))
      .map(file => ({
        file: file,
        id: nanoid(),
        displayInFeed: false,
        receipt: false,
        dataUri: ""
      }));

    setFiles([...files, ...filesArr]);
  }

  function handleFileChange(file: FileObj) {
    setFiles(files.map(f => (f.id === file.id ? file : f)));
  }

  return (
    <Card style={{ maxWidth: 290, margin: "1em auto" }}>
      <Label>
        Title
        <Input
          style={{ width: "100%" }}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </Label>

      <div className="spacer" />

      <Label>
        Log
        <Textarea value={log} onChange={e => setLog(e.target.value)} />
      </Label>

      <div className="spacer" />

      <Label>
        Upload Images (jpeg or png)
        <FileUploader
          variant="secondary"
          value={files.map(
            (f, i) => `${f.file.name}${i < files.length - 1 ? ", " : ""}`
          )}
          placeholder="Tap or drop files"
          onChange={handleFileUpload}
          multiple
        />
      </Label>

      {files.length > 0 && (
        <div>
          <p>Tap on a image to change settings</p>
          {files.map(file => (
            <Image key={file.id} obj={file} onChange={handleFileChange} />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1em 0 0"
        }}
      >
        <Button variant="primary">Save</Button>
      </div>
    </Card>
  );
}

type TProps = {
  obj: FileObj;
  onChange: (file: FileObj) => void;
};
function Image(props: TProps) {
  const { obj, onChange } = props;
  const { file } = obj;

  const [dataSrc, setDataSrc] = useState<any>();
  const [showLarge, setShowLarge] = useState(false);
  useEffect(() => {
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      function() {
        // convert image file to base64 string
        // preview.src = reader.result;
        setDataSrc(reader.result);
      },
      false
    );

    reader.readAsDataURL(file);
  }, [file]);

  return (
    <>
      <img
        src={dataSrc}
        alt={file.name}
        width={50}
        height={"auto"}
        onClick={() => setShowLarge(true)}
      />
      <Modal
        label={`${file.name} large view`}
        size={1}
        show={showLarge}
        onClose={() => setShowLarge(false)}
      >
        <label className="label-full-width">
          <Checkbox
            checked={obj.displayInFeed}
            onChange={e =>
              onChange({ ...obj, displayInFeed: e.target.checked })
            }
          />{" "}
          Display In Feed
        </label>

        <label className="label-full-width">
          <Checkbox
            checked={obj.receipt}
            onChange={e => onChange({ ...obj, receipt: e.target.checked })}
          />{" "}
          Receipt
        </label>

        <img
          src={dataSrc}
          alt={file.name}
          style={{
            display: "block",
            width: "auto",
            maxWidth: "100%",
            margin: "0 auto"
          }}
        />
      </Modal>
    </>
  );
}
