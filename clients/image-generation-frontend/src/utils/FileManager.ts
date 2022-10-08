import {downloadProgress, downloadStatus, uploadProgress} from "../stores";

class FileManager {
    private _busy = false;

    get busy(): boolean {
        return this._busy;
    }

    async downloadFile(presignedURL: string, size: number): Promise<Blob> {
        if (this._busy) throw Error("File manager busy");

        this._busy = true;
        downloadProgress.set(0);

        downloadStatus.set("starting");

        const result = new Promise<Blob>((res, rej) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200) {
                        rej("DOWNLOAD FAILED");
                    }
                }
            };

            xhr.onprogress = e => {
                if (e.lengthComputable) {
                    downloadProgress.set(e.loaded / size);
                }
            };
            xhr.onload = () => {
                const blob = xhr.response;
                downloadStatus.set("finished");
                this._busy = false;
                res(blob);
            };
            xhr.onerror = e => {
                this._busy = false;
                rej(e);
            };
            xhr.open("GET", presignedURL);
            xhr.send();
            downloadStatus.set("in progress");
        });
        return result;
    }

    async uploadFile(presignedURL: string, file: Blob): Promise<unknown> {
        if (this._busy) throw Error("File manager busy");
        uploadProgress.set(0);
        this._busy = true;

        const result = new Promise<boolean>((res, rej) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        this._busy = false;
                        res(true);
                    } else {
                        this._busy = false;
                    }
                }
            };
            xhr.onerror = e => {
                rej(e);
            };
            xhr.upload.onprogress = e => {
                if (e.lengthComputable) {
                    uploadProgress.set(e.loaded / e.total);
                }
            };
            xhr.open("PUT", presignedURL);
            xhr.send(file);
        });

        return result;
    }
}

const fileManager = new FileManager();

export {fileManager as FileManager};
