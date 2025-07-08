"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface TeamMessageSenderProps {
  teamId: number;
  onMessageSent?: () => void;
}

export function TeamMessageSender({ teamId, onMessageSent }: TeamMessageSenderProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Por favor, escreva uma mensagem para o time");
      return;
    }

    setSending(true);
    try {
      const fallbackUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://agilemood-backend-production.up.railway.app'
        : 'http://localhost:8000';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
      if (!apiUrl) {
        throw new Error('URL da API não configurada');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/teams/${teamId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          team_id: teamId,
          message
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao enviar mensagem: ${response.status} - ${response.statusText}`);
      }

      toast.success("Mensagem enviada com sucesso!");
      setMessage("");
      setOpen(false);
      
      // Chamar o callback se fornecido
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span>Nova Mensagem para o Time</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Mensagem para o Time</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para todos os membros do time visualizarem
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="team-message">Mensagem</Label>
            <Textarea
              id="team-message"
              placeholder="Escreva sua mensagem para o time aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta mensagem será visível para todos os membros do time.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !message.trim()}
          >
            {sending ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 