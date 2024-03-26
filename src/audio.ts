import { Howl } from "howler"

const gong = new Howl({
  src: ["./sounds/gong.mp3"]
})

export const audio = {
  playGong() {
    console.log("clicking sound!")
    gong.play();
  },
};
