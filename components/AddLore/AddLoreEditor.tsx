import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { ContentState, convertFromRaw, EditorState } from "draft-js";
import Editor, { composeDecorators } from "@draft-js-plugins/editor";
import createMarkdownShortcutsPlugin from "draft-js-markdown-shortcuts-plugin";
import createImagePlugin from "@draft-js-plugins/image";
import createFocusPlugin from "@draft-js-plugins/focus";
import createBlockDndPlugin from "@draft-js-plugins/drag-n-drop";
import createDragNDropUploadPlugin from "@draft-js-plugins/drag-n-drop-upload";
import createResizeablePlugin from "@draft-js-plugins/resizeable";
import createMentionPlugin, {
  defaultSuggestionsFilter
} from "@draft-js-plugins/mention";
import { markdownToDraft } from "markdown-draft-js";
import { getContrast } from "../../lib/colorUtils";
import mentions from "./WizardMentions";

const AddLoreEditorElement = styled.div<{ bg?: string }>`
  color: ${(props) => getContrast(props.bg || "#000000")};
  font-family: "Alagard";
  height: 100%;
  width: 100%;
  padding: 1em;

  h1,
  h2,
  h3,
  h4,
  h5 {
    margin-top: 0.5em;
  }
  .DraftEditor-editorContainer {
    z-index: 0 !important;
  }
`;

const defaultText = `
Okay **bold** _italic_ Got the typing here.

Here is my story

# Title
## H2
### h3
#### h4

> Blockquote

A [link](https://url.com)
`;

const resizeablePlugin = createResizeablePlugin();
const focusPlugin = createFocusPlugin();
const blockDndPlugin = createBlockDndPlugin();
const decorator = composeDecorators(
  focusPlugin.decorator,
  blockDndPlugin.decorator
);
// https://www.draft-js-plugins.com/plugin/image
const imagePlugin = createImagePlugin({ decorator });

const mockUpload = () => true;

const dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
  handleUpload: mockUpload,
  addImage: imagePlugin.addImage
});

// https://www.draft-js-plugins.com/plugin/mention

const topLevelPlugins = [
  dragNDropFileUploadPlugin,
  createMarkdownShortcutsPlugin(),
  blockDndPlugin,
  focusPlugin,
  //   resizeablePlugin,
  imagePlugin
];

const emptyContentState = convertFromRaw({
  entityMap: {},
  blocks: [
    // idk the proper typings here, but it fixes the bug referenced below
    {
      text: "",
      key: "foo",
      type: "unstyled",
      entityRanges: []
    }
  ]
});

type Props = {
  onChange: (editorState: any) => void;
  bg: string;
};
export default function AddLoreEditor({ onChange, bg }: Props) {
  const ref = useRef<Editor>(null);

  // https://github.com/facebook/draft-js/issues/2332#issuecomment-761573306
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(emptyContentState)
  );

  const performOnChange = (editorState: any) => {
    setEditorState(editorState);
    onChange(editorState);
  };

  useEffect(() => {
    setEditorState(
      EditorState.createWithContent(
        ContentState.createFromText("Write your Lore here...")
      )
    );
  }, []);

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);
  const plugins = topLevelPlugins;

  // I don't understand why this needs to be in a useMemo, but it's part of the docs
  /*
  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [...topLevelPlugins, mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);
  const onSearchChange = useCallback(({ value }: { value: string }) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions));
  }, []);
  */

  return (
    <AddLoreEditorElement bg={bg}>
      <Editor
        editorKey={"key-here"}
        editorState={editorState}
        // onChange={setEditorState}
        onChange={performOnChange}
        userSelect="none"
        contentEditable={false}
        plugins={plugins}
      />
      {/* <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
        onAddMention={() => {
          // get the mention object selected
        }}
      /> */}
    </AddLoreEditorElement>
  );
}
