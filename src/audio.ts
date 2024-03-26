import { Howl } from "howler"

const gong = new Howl({
  src: ["./sounds/gong.mp3"]
})

const click = new Howl({
  src: ["./sounds/click0.mp3"]
})

const flick = new Howl({
  src: ["./sounds/flick0.mp3"],
  volume: 0.3,
})

export const audio = {
  playGong() {
    gong.play();
  },

  playClick() {
    click.play();
  },

  playFlick() {
    flick.play();
  },
};
