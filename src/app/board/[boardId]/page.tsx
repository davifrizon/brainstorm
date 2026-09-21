import { BoardClientLoader } from "@/components/board/BoardClientLoader";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <BoardClientLoader boardId={boardId} />;
}
