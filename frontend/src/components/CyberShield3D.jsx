import React, { useRef, useEffect, useState } from 'react';
import { Shield, Lock, Activity, Zap, Cpu, Radar, Terminal, Compass } from 'lucide-react';

export const CyberShield3D = ({ riskScore = 87, activeOrgName = 'Zenith Logistics & Maritime' }) => {
  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: 144, y: 144 });
  const [hudCoord, setHudCoord] = useState({ x: '0x4F', y: '0xA2', sector: 'SEC-09' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;
    let pulseRadius = 0;

    // 3D Geodesic Icosahedron Vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
    ].map(([x, y, z]) => {
      const len = Math.sqrt(x*x + y*y + z*z);
      return [x / len * 68, y / len * 68, z / len * 68];
    });

    // 32 Orbiting Defense Nodes
    const particles = [];
    for (let i = 0; i < 32; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: (Math.random() - 0.5) * Math.PI,
        radius: 72 + Math.random() * 42,
        speed: (Math.random() * 0.012 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angle += 0.014;
      pulseRadius = (pulseRadius + 0.8) % 110;

      // Mouse influence on 3D rotation
      const mouse = mousePosRef.current;
      const targetTiltX = (mouse.y / canvas.height - 0.5) * 0.7;
      const targetTiltY = (mouse.x / canvas.width - 0.5) * 0.7;

      // 1. Concentric Expanding Sonar Wave
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 153, ${Math.max(0, 0.4 * (1 - pulseRadius / 110))})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 2. Concentric Holographic Defense Rings with HUD Ticks
      for (let ring = 0; ring < 3; ring++) {
        ctx.save();
        ctx.translate(cx, cy);
        const ringDir = ring % 2 === 0 ? 1 : -1;
        ctx.rotate(angle * 0.6 * ringDir + ring * 1.1);
        ctx.scale(1, 0.42 + ring * 0.16);

        const rSize = 75 + ring * 20;
        ctx.beginPath();
        ctx.arc(0, 0, rSize, 0, Math.PI * 2);
        ctx.strokeStyle = ring === 0 ? 'rgba(0, 229, 153, 0.5)' : 'rgba(16, 185, 129, 0.18)';
        ctx.lineWidth = ring === 0 ? 1.8 : 1;
        ctx.setLineDash(ring === 0 ? [14, 8, 4, 8] : [8, 12]);
        ctx.stroke();

        // Orbiting Ring Satellite Node
        const nodeAngle = angle * 2.2 * ringDir + ring;
        const nx = Math.cos(nodeAngle) * rSize;
        const ny = Math.sin(nodeAngle) * rSize;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#00e599';
        ctx.shadowColor = '#00e599';
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.restore();
      }

      // 3. 3D Geodesic Wireframe Lattice
      const rotVertices = baseVertices.map(([vx, vy, vz]) => {
        const cosY = Math.cos(angle * 0.7 + targetTiltY);
        const sinY = Math.sin(angle * 0.7 + targetTiltY);
        const x1 = vx * cosY + vz * sinY;
        const z1 = -vx * sinY + vz * cosY;

        const cosX = Math.cos(angle * 0.4 + targetTiltX);
        const sinX = Math.sin(angle * 0.4 + targetTiltX);
        const y2 = vy * cosX - z1 * sinX;
        const z2 = vy * sinX + z1 * cosX;

        const fov = 250;
        const scale = fov / (fov + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2
        };
      });

      // Connect Geodesic Lines
      ctx.lineWidth = 1;
      for (let i = 0; i < rotVertices.length; i++) {
        for (let j = i + 1; j < rotVertices.length; j++) {
          const vA = rotVertices[i];
          const vB = rotVertices[j];
          const dist = Math.hypot(vA.x - vB.x, vA.y - vB.y);

          if (dist < 56) {
            const alpha = Math.max(0.06, 0.3 * (1 - dist / 56));
            ctx.beginPath();
            ctx.moveTo(vA.x, vA.y);
            ctx.lineTo(vB.x, vB.y);
            ctx.strokeStyle = (vA.z > 0 && vB.z > 0)
              ? `rgba(0, 229, 153, ${alpha})`
              : `rgba(16, 185, 129, ${alpha * 0.35})`;
            ctx.stroke();
          }
        }
      }

      // 4. Projected 3D Particle Constellation with Proximity Laser Beams
      const projectedParticles = [];
      particles.forEach((p) => {
        p.theta += p.speed;
        const rotTheta = p.theta + targetTiltY;
        const rotPhi = p.phi + targetTiltX;

        const x3d = p.radius * Math.cos(rotPhi) * Math.sin(rotTheta);
        const y3d = p.radius * Math.sin(rotPhi);
        const z3d = p.radius * Math.cos(rotPhi) * Math.cos(rotTheta);

        const fov = 240;
        const scale = fov / (fov + z3d);
        const projX = cx + x3d * scale;
        const projY = cy + y3d * scale;

        projectedParticles.push({ x: projX, y: projY, z: z3d, size: p.size * scale, alpha: p.alpha });

        ctx.save();
        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = z3d > 0 ? `rgba(0, 229, 153, ${p.alpha})` : `rgba(5, 150, 105, ${p.alpha * 0.4})`;
        if (z3d > 15) {
          ctx.shadowColor = '#00e599';
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.restore();
      });

      // Proximity Laser Tracers between close particles
      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const pA = projectedParticles[i];
          const pB = projectedParticles[j];
          const d = Math.hypot(pA.x - pB.x, pA.y - pB.y);
          if (d < 36) {
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = `rgba(0, 229, 153, ${0.35 * (1 - d / 36)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 5. Central Holographic Energy Shield Core
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(angle * 0.6) * 0.08);

      const coreGradient = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
      coreGradient.addColorStop(0, 'rgba(0, 229, 153, 0.45)');
      coreGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.fill();

      // Holographic Shield Outline
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(24, -16);
      ctx.lineTo(20, 14);
      ctx.lineTo(0, 28);
      ctx.lineTo(-20, 14);
      ctx.lineTo(-24, -16);
      ctx.closePath();

      ctx.strokeStyle = '#00e599';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#00e599';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 153, 0.1)';
      ctx.fill();

      // Inner Core Pulse Check
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-2, 6);
      ctx.lineTo(9, -6);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.6;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.restore();

      // 6. Interactive HUD Crosshair on Mouse Target
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 153, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mouse.x - 18, mouse.y);
      ctx.lineTo(mouse.x + 18, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 18);
      ctx.lineTo(mouse.x, mouse.y + 18);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      mousePosRef.current = { x: curX, y: curY };
      setHudCoord({
        x: '0x' + Math.floor(curX).toString(16).toUpperCase().padStart(2, '0'),
        y: '0x' + Math.floor(curY).toString(16).toUpperCase().padStart(2, '0'),
        sector: `SEC-${Math.floor((curX / 280) * 12 + 1).toString().padStart(2, '0')}`,
      });
    }
  };

  return (
    <div 
      className="card-3d relative rounded-2xl p-5 sm:p-6 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 border border-[#18262a]"
      onMouseMove={handleMouseMove}
    >
      {/* Background Decorative Cyber Grid & Radial Energy Field */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,153,0.08),_transparent_75%)] pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-emerald-500/50 hidden sm:block pointer-events-none">
        GRID-LOC: [{hudCoord.x} : {hudCoord.y}] | {hudCoord.sector}
      </div>

      {/* Left Info Column */}
      <div className="space-y-3.5 z-10 flex-1 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5" />
            Autonomous 3D Quantum Defense Grid
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
            NEURAL CORE v4.0
          </span>
        </div>

        <div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">PROTECTED ENTERPRISE ASSET PERIMETER</div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
            {activeOrgName}
          </h3>
        </div>

        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
          Interactive real-time 3D defense lattice. Continuously evaluating MITRE ATT&CK techniques, verifying immutable SHA-256 canonical audit proofs, and calculating compound Monte Carlo loss bounds across cloud, DMZ, and container assets.
        </p>

        {/* 4 Real-time Tactical HUD Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-lg bg-[#060b0e] border border-[#18262a] text-xs font-mono shadow-sm">
            <span className="text-[10px] text-slate-500 block">DEFLECTION RATE</span>
            <span className="font-bold text-emerald-400 text-sm">99.85%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#060b0e] border border-[#18262a] text-xs font-mono shadow-sm">
            <span className="text-[10px] text-slate-500 block">QUANTUM ENTROPY</span>
            <span className="font-bold text-teal-300 text-sm">256-BIT</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#060b0e] border border-[#18262a] text-xs font-mono shadow-sm">
            <span className="text-[10px] text-slate-500 block">LATENCY PROBE</span>
            <span className="font-bold text-emerald-400 text-sm">11ms</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#060b0e] border border-[#18262a] text-xs font-mono shadow-sm">
            <span className="text-[10px] text-slate-500 block">EVM INTEGRITY</span>
            <span className="font-bold text-emerald-400 text-sm">SEALED</span>
          </div>
        </div>
      </div>

      {/* Right: Interactive 3D Canvas Visualizer with HUD Reticle */}
      <div className="relative z-10 shrink-0 flex items-center justify-center">
        <div className="relative w-72 h-72 flex items-center justify-center rounded-2xl bg-[#04080a]/60 border border-[#18262a] shadow-[0_0_50px_rgba(0,229,153,0.12)]">
          {/* Corner Cyber Accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-500/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-500/60 pointer-events-none" />

          <canvas
            ref={canvasRef}
            width={288}
            height={288}
            className="w-72 h-72 cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
};

export default CyberShield3D;

