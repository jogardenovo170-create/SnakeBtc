"use client";

import { useEffect, useRef, useState } from "react";
import "./style.css";

const SIZE = 20;
const CELL = 20;

export default function Home() {
  const canvasRef = useRef(null);
  const game = useRef({
    snake:[{x:10,y:10},{x:9,y:10},{x:8,y:10}],
    dir:{x:1,y:0},
    next:{x:1,y:0},
    food:{x:4,y:4},
    dead:false,
    paused:false
  });

  const [points,setPoints] = useState(0);
  const [sats,setSats] = useState(0);
  const [destination,setDestination] = useState("");
  const [message,setMessage] = useState("Apanha os quadrados. Cada um vale 10 pontos.");
  const [withdrawing,setWithdrawing] = useState(false);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = game.current;

    ctx.fillStyle = "#0b1118";
    ctx.fillRect(0,0,400,400);

    ctx.strokeStyle = "#16222d";
    for (let i=0;i<=SIZE;i++) {
      ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(400,i*CELL); ctx.stroke();
    }

    ctx.fillStyle = "#ffb000";
    ctx.fillRect(g.food.x*CELL+3,g.food.y*CELL+3,14,14);

    g.snake.forEach((p,i)=>{
      ctx.fillStyle = i===0 ? "#9ff3c9" : "#35b67f";
      ctx.fillRect(p.x*CELL+1,p.y*CELL+1,18,18);
    });
  }

  function turn(x,y) {
    const g = game.current;
    if (x===-g.dir.x && y===-g.dir.y) return;
    g.next={x,y};
  }

  function newFood() {
    const g = game.current;
    do {
      g.food={x:Math.floor(Math.random()*SIZE),y:Math.floor(Math.random()*SIZE)};
    } while (g.snake.some(p=>p.x===g.food.x && p.y===g.food.y));
  }

  function restart() {
    game.current={
      snake:[{x:10,y:10},{x:9,y:10},{x:8,y:10}],
      dir:{x:1,y:0},next:{x:1,y:0},food:{x:4,y:4},
      dead:false,paused:false
    };
    setPoints(0);
    setMessage("Novo jogo iniciado.");
    setTimeout(draw,0);
  }

  function togglePause() {
    const g=game.current;
    if (g.dead) return;
    g.paused=!g.paused;
    setMessage(g.paused ? "Jogo em pausa." : "Jogo retomado.");
  }

  useEffect(()=>{
    const onKey=(e)=>{
      const map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
      if (map[e.key]) {
        e.preventDefault();
        turn(...map[e.key]);
      }
    };

    window.addEventListener("keydown",onKey);

    const timer=setInterval(()=>{
      const g=game.current;
      if (g.dead || g.paused) return;

      g.dir=g.next;
      const head={x:g.snake[0].x+g.dir.x,y:g.snake[0].y+g.dir.y};
      const hitWall=head.x<0||head.y<0||head.x>=SIZE||head.y>=SIZE;
      const hitSelf=g.snake.some(p=>p.x===head.x&&p.y===head.y);

      if (hitWall||hitSelf) {
        g.dead=true;
        setMessage("Fim do jogo. Carrega em Reiniciar.");
        return;
      }

      g.snake.unshift(head);

      if (head.x===g.food.x && head.y===g.food.y) {
        setPoints(v=>v+10);
        newFood();
      } else {
        g.snake.pop();
      }

      draw();
    },130);

    draw();
    return ()=>{
      clearInterval(timer);
      window.removeEventListener("keydown",onKey);
    };
  },[]);

  function convert() {
    const amount=Math.floor(points/100);
    if (amount<1) {
      setMessage("Precisas de pelo menos 100 pontos.");
      return;
    }
    setPoints(v=>v-amount*100);
    setSats(v=>v+amount);
    setMessage(`${amount} sat convertido para o saldo do jogo ⚡`);
  }

  async function withdraw() {
    if (withdrawing) return;
    if (!destination.trim()) {
      setMessage("Introduz uma Lightning Address ou invoice.");
      return;
    }
    if (sats<1) {
      setMessage("Ainda não tens sats suficientes.");
      return;
    }

    try {
      setWithdrawing(true);
      setMessage("A processar pagamento...");

      const res=await fetch("/api/withdraw",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          destination:destination.trim(),
          amount:sats
        })
      });

      const data=await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erro no pagamento.");
        return;
      }

      setMessage("Pagamento enviado ⚡");
      setSats(0);
    } catch {
      setMessage("Não foi possível ligar ao backend Lightning.");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <main>
      <header>
        <div className="coin">₿</div>
        <div>
          <h1>Cobra Lightning</h1>
          <p className="subtitle">Joga • acumula pontos • converte para sats</p>
        </div>
      </header>

      <div className="stats">
        <div><span>PONTOS</span><strong>{points}</strong></div>
        <div><span>SALDO</span><strong>{sats} sats</strong></div>
        <div><span>TAXA</span><strong>100 = 1 sat</strong></div>
      </div>

      <canvas ref={canvasRef} width="400" height="400" />
      <p className="message">{message}</p>

      <div className="pad">
        <button onClick={()=>turn(0,-1)}>↑</button>
        <div>
          <button onClick={()=>turn(-1,0)}>←</button>
          <button onClick={()=>turn(0,1)}>↓</button>
          <button onClick={()=>turn(1,0)}>→</button>
        </div>
      </div>

      <div className="actions">
        <button onClick={togglePause}>⏸ Pausa</button>
        <button onClick={restart}>↻ Reiniciar</button>
        <button className="primary" onClick={convert}>⚡ Converter pontos</button>
      </div>

      <section>
        <h2>Levantar sats ⚡</h2>
        <input
          value={destination}
          onChange={e=>setDestination(e.target.value)}
          placeholder="Lightning Address ou invoice"
        />
        <button className="primary full" onClick={withdraw} disabled={withdrawing}>
          {withdrawing ? "A processar..." : "Levantar sats ⚡"}
        </button>
        <small>
          Backend Lightning genérico. Configura LIGHTNING_API_URL e LIGHTNING_API_KEY na Vercel.
        </small>
      </section>
    </main>
  );
}
