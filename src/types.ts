type Fields = {
  Front: string;
  Back: string;
};

type Media = {
  url: string;
  filename: string;
  skipHash: string;
  fields: string[];
};

type Note = {
  deckName: string;
  modelName: string;
  fields: Fields;
  tags: string[];
  audio: Media[];
  video: Media[];
  picture: Media[];
};

export type NotesRequest = {
  notes: Note[];
};

export type DeckRequest = {
  deck: string;
};
