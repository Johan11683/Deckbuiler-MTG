// app/decks/[id]/page.jsx
import DeckEditor from "../../../components/DeckEditor";

export default async function DeckEditorPage({ params }) {
  const { id } = await Promise.resolve(params);
  return (
    <main className="container">
      <DeckEditor deckId={id} />
    </main>
  );
}
