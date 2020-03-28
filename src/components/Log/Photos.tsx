import React, { useState, useEffect, ChangeEvent } from "react";
import { Checkbox } from "@mbkit/checkbox";
import { FileUploader } from "@mbkit/file-uploader";
import { Label } from "@mbkit/label";
import nanoid from "nanoid";
import "./Log.scss";

interface PhotosProps {
  files: FileObj[];
  setFiles: (files: FileObj[]) => void;
}

export type FileObj = {
  file: File;
  id: string;
  displayInFeed: boolean;
  receipt: boolean;
  dataUri: string;
};

export function Photos(props: PhotosProps) {
  const { files, setFiles } = props;

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
    <>
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
        <div className="photos">
          {files.map(file => (
            <div key={file.id}>
              <ImagePreview obj={file} onChange={handleFileChange} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

type TProps = {
  obj: FileObj;
  onChange: (file: FileObj) => void;
};
function ImagePreview(props: TProps) {
  const { obj, onChange } = props;
  const { file, dataUri } = obj;

  // const [dataSrc, setDataSrc] = useState<any>();
  useEffect(() => {
    if (!dataUri) {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          // convert image file to base64 string
          if (typeof reader.result === "string") {
            //Initiate the JavaScript Image object.
            var image = new Image();

            //Set the Base64 string return from FileReader as source.
            image.src = reader.result;

            // //Validate the File Height and Width.
            // image.onload = function() {
            //   const that: any = this;
            //   var height = that.height;
            //   var width = that.width;
            //   // Do something with aspect ratio
            //   // console.log(height, width);
            // };
            // setDataSrc(reader.result);
            onChange({
              ...obj,
              dataUri: reader.result
            });
          }
        },
        false
      );
      reader.readAsDataURL(file);
    }
    /* eslint-disable-next-line */
  }, [file, dataUri]);

  return (
    <>
      <label className="label-full-width">
        <Checkbox
          checked={obj.displayInFeed}
          onChange={e => onChange({ ...obj, displayInFeed: e.target.checked })}
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

      <img src={dataUri} alt={file.name} />
    </>
  );
}
