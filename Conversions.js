/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "id": "convertID",
                "name": "Conversions",
                "color1": "#42853d",
                "color2": "#25a244",
                "tbShow": true,
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    blocks.push({
        opcode: "msectosec",
        blockType: Scratch.BlockType.REPORTER,
        text: "[MSECID] Milliseconds to seconds ",
        arguments: {
            "MSECID": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 60,
            },
        },
        disableMonitor: true
    });
    Extension.prototype["msectosec"] = async (args, util) => {
        return (args["MSECID"] * 1 / 1000)
    };

    blocks.push({
        opcode: "sectomin",
        blockType: Scratch.BlockType.REPORTER,
        text: "[SECID] Seconds to minutes",
        arguments: {
            "SECID": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 60,
            },
        },
        disableMonitor: true
    });
    Extension.prototype["sectomin"] = async (args, util) => {
        return (args["SECID"] * 1000 / 60000)
    };

    blocks.push({
        opcode: "mintohour",
        blockType: Scratch.BlockType.REPORTER,
        text: "[MINID] Minutes to hours",
        arguments: {
            "MINID": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 60,
            },
        },
        disableMonitor: true
    });
    Extension.prototype["mintohour"] = async (args, util) => {
        return (args["MINID"] * 60000 / 3600000)
    };

    blocks.push({
        opcode: "hourtoday",
        blockType: Scratch.BlockType.REPORTER,
        text: "[HOURID] Hours to days",
        arguments: {
            "HOURID": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 24,
            },
        },
        disableMonitor: true
    });
    Extension.prototype["hourtoday"] = async (args, util) => {
        return (args["HOURID"] * 3600000 / 86400000)
    };

    blocks.push({
        opcode: "alert",
        blockType: Scratch.BlockType.COMMAND,
        text: "Alert [ALERTID]",
        arguments: {
            "ALERTID": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello World!',
            },
        },
        disableMonitor: true
    });
    Extension.prototype["alert"] = async (args, util) => {
        alert(args["ALERTID"])
    };

    blocks.push({
        opcode: "prompt",
        blockType: Scratch.BlockType.REPORTER,
        text: "Prompt [PROMPTID]",
        arguments: {
            "PROMPTID": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'What\'s your name?',
            },
        },
        disableMonitor: true
    });
    Extension.prototype["prompt"] = async (args, util) => {
        return prompt(args["PROMPTID"])
    };

    blocks.push({
        opcode: "confirm",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "Confirm [CONFIRMID]",
        arguments: {
            "CONFIRMID": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Do oranges turn yellow?',
            },
        },
        disableMonitor: true
    });
    Extension.prototype["confirm"] = async (args, util) => {
        return confirm(args["CONFIRMID"])
    };

    Scratch.extensions.register(new Extension());
})(Scratch);