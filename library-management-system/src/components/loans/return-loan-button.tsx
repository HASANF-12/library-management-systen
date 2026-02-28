"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { returnLoan } from "@/app/loans/actions";
import { useToast } from "@/components/ui/use-toast";

export function ReturnLoanButton({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleReturn() {
    startTransition(async () => {
      const result = await returnLoan(loanId);
      if (result?.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Book returned." });
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReturn} disabled={isPending}>
      {isPending ? "Returning…" : "Mark returned"}
    </Button>
  );
}
