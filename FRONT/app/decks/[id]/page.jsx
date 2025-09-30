// app/decks/[id]/page.jsx
import DeckEditor from "../../../components/DeckEditor";

export default async function DeckEditorPage({ params }) {
  const { id } = await params; // ✅ on attend params
  return (
    <main>
      <DeckEditor deckId={id} />
    </main>
  );
}
