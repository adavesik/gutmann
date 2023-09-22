// gutmann.js
const fs     = require('fs');
const crypto = require('crypto');
const util   = require('util');
const path = require('path');

const open      = util.promisify(fs.open);
const close     = util.promisify(fs.close);
const read      = util.promisify(fs.read);
const write     = util.promisify(fs.write);
const fdatasync = util.promisify(fs.fdatasync);
const readdir   = util.promisify(fs.readdir);
const lstat     = util.promisify(fs.lstat);
const stat      = util.promisify(fs.stat);
const unlink    = util.promisify(fs.unlink);

class Gutmann {
    constructor(targetPath, options, passes) {
        this.targetPath = targetPath;
        this.options = options;
        this.GutmannPasses = passes;
        this.gutmanns = new Array(this.GutmannPasses);
    }

    async run() {
        try {
            if (this.options.file) {
                // Erase a file
                await this.eraseFiles(this.targetPath);
            } else if (this.options.dir) {
                // TODO Erase a directory
                await this.eraseDirectories(this.targetPath);
            } else {
                throw new Error('Invalid options. Please specify either "file" or "dir" in command line.');
            }

            console.log('Gutmann algorithm completed successfully.');
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    async eraseFiles(filePaths) {
        for (const filePath of filePaths) {
            await this.eraseFile(filePath);
        }
    }

    async eraseDirectories(dirPaths) {
        for (const dirPath of dirPaths) {
            try {
                const stack = [dirPath];
                const results = [];

                while (stack.length > 0) {
                    const currentPath = stack.pop();
                    const entries = await readdir(currentPath);

                    for (const entry of entries) {
                        const entryPath = path.join(currentPath, entry);
                        const stats = await stat(entryPath);

                        if (stats.isDirectory()) {
                            stack.push(entryPath); // Add directories to the stack for further processing
                        } else {
                            results.push(entryPath); // Add files to the results array
                            // Run Gutmann on the file concurrently
                            console.log(entryPath);
                            await this.eraseFile(entryPath)
                                .then(() => console.log(`Erasure completed on ${entryPath}`))
                                .catch((error) => {
                                console.error(`Error running Gutmann on ${entryPath}: ${error.message}`);
                            });
                        }
                    }
                }
                
            } catch (e) {
                console.error(`Error processing directory: ${dirPath}`, e);
            }
        }
    }

    /**
     * @param {number} fd
     */
    fileSize = async (fd) => {
        const promisifiedFstat = util.promisify(fs.fstat);
        const stats = await promisifiedFstat(fd);

        return stats.size;
    };

    async eraseFile(filePath) {

        try {

            const fd = await open(filePath, 'r+');
            const fileSize = await this.fileSize(fd);
            const writeBuffer = Buffer.alloc(fileSize);

            for (let i = 0; i < this.gutmanns.length; i++) {
                if ([14, 19, 25, 26, 27].includes(i)) {
                    continue;
                }
                (this.gutmanns)[i] = crypto.randomBytes(fs.statSync(filePath).size);
            }

            // Generate random bytes for the first 4 passes
            for (let i = 0; i < 4; i++) {
                (this.gutmanns)[i] = crypto.randomBytes(fs.statSync(filePath).size);
                (this.gutmanns)[31 + i] = crypto.randomBytes(fs.statSync(filePath).size);
            }

            // Init with patterns (gutmanns[9] is null)
            for (let i = 0; i < 10;) {
                (this.gutmanns)[4][i] = 0x55;
                (this.gutmanns)[5][i] = 0xAA;
                (this.gutmanns)[6][i] = 0x92;
                (this.gutmanns)[7][i] = 0x49;
                (this.gutmanns)[8][i] = 0x24;
                (this.gutmanns)[10][i] = 0x11;
                (this.gutmanns)[11][i] = 0x22;
                (this.gutmanns)[12][i] = 0x33;
                (this.gutmanns)[13][i] = 0x44;
                (this.gutmanns)[15][i] = 0x66;
                (this.gutmanns)[16][i] = 0x77;
                (this.gutmanns)[17][i] = 0x88;
                (this.gutmanns)[18][i] = 0x99;
                (this.gutmanns)[20][i] = 0xBB;
                (this.gutmanns)[21][i] = 0xCC;
                (this.gutmanns)[22][i] = 0xDD;
                (this.gutmanns)[23][i] = 0xEE;
                (this.gutmanns)[24][i] = 0xFF;
                (this.gutmanns)[28][i] = 0x6D;
                (this.gutmanns)[29][i] = 0xB6;
                (this.gutmanns)[30][i++] = 0xDB;

                if (i >= fs.statSync(filePath).size) {
                    continue;
                }

                (this.gutmanns)[4][i] = 0x55;
                (this.gutmanns)[5][i] = 0xAA;
                (this.gutmanns)[6][i] = 0x49;
                (this.gutmanns)[7][i] = 0x24;
                (this.gutmanns)[8][i] = 0x92;
                (this.gutmanns)[10][i] = 0x11;
                (this.gutmanns)[11][i] = 0x22;
                (this.gutmanns)[12][i] = 0x33;
                (this.gutmanns)[13][i] = 0x44;
                (this.gutmanns)[15][i] = 0x66;
                (this.gutmanns)[16][i] = 0x77;
                (this.gutmanns)[17][i] = 0x88;
                (this.gutmanns)[18][i] = 0x99;
                (this.gutmanns)[20][i] = 0xBB;
                (this.gutmanns)[21][i] = 0xCC;
                (this.gutmanns)[22][i] = 0xDD;
                (this.gutmanns)[23][i] = 0xEE;
                (this.gutmanns)[24][i] = 0xFF;
                (this.gutmanns)[28][i] = 0xB6;
                (this.gutmanns)[29][i] = 0xDB;
                (this.gutmanns)[30][i++] = 0x6D;

                if (i >= fs.statSync(filePath).size) {
                    continue;
                }

                (this.gutmanns)[4][i] = 0x55;
                (this.gutmanns)[5][i] = 0xAA;
                (this.gutmanns)[6][i] = 0x24;
                (this.gutmanns)[7][i] = 0x92;
                (this.gutmanns)[8][i] = 0x49;
                (this.gutmanns)[10][i] = 0x11;
                (this.gutmanns)[11][i] = 0x22;
                (this.gutmanns)[12][i] = 0x33;
                (this.gutmanns)[13][i] = 0x44;
                (this.gutmanns)[15][i] = 0x66;
                (this.gutmanns)[16][i] = 0x77;
                (this.gutmanns)[17][i] = 0x88;
                (this.gutmanns)[18][i] = 0x99;
                (this.gutmanns)[20][i] = 0xBB;
                (this.gutmanns)[21][i] = 0xCC;
                (this.gutmanns)[22][i] = 0xDD;
                (this.gutmanns)[23][i] = 0xEE;
                (this.gutmanns)[24][i] = 0xFF;
                (this.gutmanns)[28][i] = 0xDB;
                (this.gutmanns)[29][i] = 0x6D;
                (this.gutmanns)[30][i++] = 0xB6;
            }

            (this.gutmanns)[14] = (this.gutmanns)[4];
            (this.gutmanns)[19] = (this.gutmanns)[5];
            (this.gutmanns)[25] = (this.gutmanns)[6];
            (this.gutmanns)[26] = (this.gutmanns)[7];
            (this.gutmanns)[27] = (this.gutmanns)[8];

            for (let i = 0; i < this.gutmanns.length; i++)
            {
                // Seek to the beginning of the file
                const seekPosition = 0;
                await read(fd, Buffer.alloc(0), 0, 0, seekPosition);
                await write(fd, this.gutmanns[i], 0, this.gutmanns[i].length, 0);
                await fdatasync(fd); // Flush()
            }
            await unlink(filePath);

        } catch (error) {
            console.error('Error erasing file:', error.message);
        }
    }
}

module.exports = Gutmann;
