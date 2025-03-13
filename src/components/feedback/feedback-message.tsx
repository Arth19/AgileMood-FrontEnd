"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface FeedbackMessageProps {
  teamId: number;
  memberId?: number;
  memberName?: string;
  emotionId?: number;
  emotionName?: string;
  isAnonymous?: boolean;
}

export function FeedbackMessage({ 
  teamId, 
  memberId, 
  memberName, 
  emotionId, 
  emotionName,
  isAnonymous = false 
}: FeedbackMessageProps) {
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(isAnonymous);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendFeedback = async () => {
    if (!message.trim()) {
      toast.error("Por favor, escreva uma mensagem de feedback");
      return;
    }

    setSending(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('URL da API não configurada');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          team_id: teamId,
          user_id: memberId,
          emotion_id: emotionId,
          message,
          is_anonymous: anonymous
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao enviar feedback: ${response.status} - ${response.statusText}`);
      }

      toast.success("Feedback enviado com sucesso!");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Ocorreu um erro ao enviar o feedback. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Enviar Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>
            {memberName ? (
              <>Envie uma mensagem de feedback para <strong>{memberName}</strong></>
            ) : (
              <>Envie uma mensagem de feedback para o colaborador</>
            )}
            {emotionName && (
              <> sobre a emoção <strong>{emotionName}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-mode" className="flex items-center gap-2">
              Modo Anônimo
              {anonymous && (
                <span className="text-xs text-amber-600 font-medium">
                  (Você não saberá quem é o colaborador)
                </span>
              )}
            </Label>
            <Switch 
              id="anonymous-mode" 
              checked={anonymous} 
              onCheckedChange={setAnonymous} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="feedback-message">Mensagem de Feedback</Label>
            <Textarea
              id="feedback-message"
              placeholder="Escreva sua mensagem de feedback aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            {anonymous && (
              <p className="text-xs text-gray-500 mt-1">
                Nota: Embora você não saiba quem é o colaborador, ele saberá que esta mensagem veio do gerente do time.
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSendFeedback} 
            disabled={sending || !message.trim()}
          >
            {sending ? "Enviando..." : "Enviar Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 