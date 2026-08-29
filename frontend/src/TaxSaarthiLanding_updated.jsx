import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight, Upload, FileText, X, CheckCircle2, Sparkles,
  TrendingUp, ListChecks, CalendarClock, LayoutGrid, FileBarChart2,
  ScanLine, Network, ShieldCheck, Menu, ChevronRight, Bot, Send,
  BadgeIndianRupee, SlidersHorizontal, MessageSquareText, Lock,
  Eye, UserCog, Compass, Check, Minus
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* DESIGN TOKENS                                                       */
/* ------------------------------------------------------------------ */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const T = {
  bg: "#050B18",
  bgSoft: "#070F20",
  surface: "#0A1428",
  surface2: "#0F1C38",
  border: "#1B2945",
  borderStrong: "#2C4270",
  textPrimary: "#EEF2FA",
  textSecondary: "#8C9AB8",
  textFaint: "#5D6B8A",
  accent: "#4C7FFF",
  accentSoft: "#1A2D5C",
  cyan: "#38E0E0",
  amber: "#E8B34C",
};

const serif = { fontFamily: "'Fraunces', serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const sans = { fontFamily: "'Inter', sans-serif" };

const fmtINR = (n) =>
  "\u20B9" + Math.round(n).toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/* ROUTER (lightweight, hash-based)                                    */
/* ------------------------------------------------------------------ */
const PAGES = ["home", "product", "how-it-works", "pricing", "about"];

function useRouter() {
  const parse = () => {
    const raw = (window.location.hash || "").replace(/^#\/?/, "");
    const seg = raw.split("/")[0];
    return PAGES.includes(seg) ? seg : "home";
  };
  const [page, setPage] = useState(parse());
  const [scrollTarget, setScrollTarget] = useState(null);

  useEffect(() => {
    const onHash = () => setPage(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((nextPage, anchor) => {
    setPage(nextPage);
    setScrollTarget(anchor || null);
    if (window.location.hash !== "#/" + nextPage) {
      window.location.hash = "#/" + nextPage;
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (scrollTarget) {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setScrollTarget(null);
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [page]);

  return { page, navigate };
}

/* ------------------------------------------------------------------ */
/* REVEAL ON SCROLL                                                    */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION LABEL                                                       */
/* ------------------------------------------------------------------ */
function Eyebrow({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${T.border}`,
        background: "rgba(76,127,255,0.06)",
        color: T.accent,
        fontSize: 12,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...mono,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan }} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BUTTONS                                                             */
/* ------------------------------------------------------------------ */
function PrimaryButton({ children, small, style = {}, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: T.accent,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: small ? "9px 16px" : "13px 24px",
        fontSize: small ? 13.5 : 15,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset",
        ...sans,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#3D6DF0";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.accent;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, style = {}, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "transparent",
        color: T.textPrimary,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "13px 22px",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...sans,
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.borderStrong)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* NAVBAR                                                              */
/* ------------------------------------------------------------------ */
const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABh8AAADUCAYAAACMNDINAAAl4ElEQVR42u3de7RnVX0Y8O/NYIQh7epQH4zaZMCVzkAso4QMWjuIDx66QEzLIxFwGSPBpaBWINUS+ENQEwqNCFKMmhgEExBTEJbyUAuDqQ4or1Yc6kKmqTy0ZlgxZRB1uP2DGebO475+9/zO2d+9P5+17hJh5p59vt999tn7fM9jYsNPfhYAAAAAANC6t1zwLEHoyC8JAQAAAAAA0CXFBwAAAAAAoFOKDwAAAAAAQKcUHwAAAAAAgE4pPgAAAAAAAJ1SfAAAAAAAADql+AAAAAAAAHRK8QEAAAAAAOiU4gMAAAAAANApxQcAAAAAAKBTig8AAAAAAECnFB8AAAAAAIBOKT4AAAAAAACdUnwAADLYLSIuiogNETHZwc81EbFcWAEAANjOZA8/TVB8AABKcccME7ONEXFKRCzpaFtHRcS6WSaDn5YSAAAAxuDkFnZyYsNPfibVAEDfMt/pMSF9AAAAdXrLBc/qa71a/dpylwX83UldkXk6PSIuEIYUx5ALa/nHvoMj4lbpSpu/CbFPtS9LI+JRh5dxo2cbI2J36cEcs1kfjIizhGGsvhERn42Iz0TEE8JR9dyOPOeAyQr3yfgwfntExGPSMgyvXaJP5wsBFbgwSTtvkaodvEwIBpl0tvA+y0em7Ocp0k5PFgsBNE3hYfxeERGXxNPF3rm8u3utkEFzlglBCueO8HeuFrZuKD7AMEq/EPdTKZrWe/WztO5M0s7sd8809wGt7Vw0Zf9f77Bzvh6zP5EitvOAYwoGsyqmL0ysEh6AVI7paTsvrz2Qig/AzjxbCGbk0cp8slzsyPpqumXRdsFhOl8SF8bsD4WA7ewtBFCktbFtMeJBIQEgnn7FX9UUHwBGc0+Sdrromcvpydp7mgX0vI5Fx2MuXtUG4/ErQgDb3LhhfgBAtRQfoH+T2lmFlyZq692OuRQyPVHzts1x9S2f0fqj8TWHOxP1KcjUF/5RqmDa+YExHaAcPlLdgV2EAGBkE0kWCCsbzlGWj//+KEk7fykiNjn0OzE5ZRwBADBHACjLHtHPNZ/dIuKJWoPoyQfo1zXJ2vsLKatuEdOai5K08/lJ+pDCw3jiepEwGDMXyFNInO8YgyrPRY4VgPptrHnnFB+gX0cla+8iKZtVpjuSXtXggk0fWrhTLHzFmOKdJgT6gBBA1XNa8wQAUlJ8AFi4LAWIW6SKERa77srvN97vFgagEUuEAOY9T9hbGADIRPEB+p0sajfyaT+nmhBDtnOh2Ov7jlkayf0GqYN5e8B4D2DNnoniA4ATUm0+n6SdexTarsMsaosgBwCAeQKAcT01xQfox9uTt9+Hp+dmqZNaEY5O0s7HCmzTTRFxg0PZsdqwu5O3/z9LYXMOM86BeQIAlErxAfrxyeTt9+HpuXk0UVvXWoQNaqLQ2B3iMNanG7cyefv/vRQ2R8EYzBMAoFiKDwDdyvL6pVXOaYM53sIV+QF4hg9Pg3kCQMl2FYLRKT6AyaBJbffeIKeD2JSknZ/TDxgxT7sJg2PBMU2FufbhaTAeAJTsSWP56BQfALr35URtXV1JzB9P0s7Snoz5qMM1lY1CAABMQwECgOIoPsB47W1C26wsr19aU0m8Fydo4/UFzgHe41A1DhMREedWtj8XSWn1ansSytgGjiUAKqT4AOP1gBA07UMWKdo/xZGFtWeTQ1Sf5xlnVrY/p0hp9TwJBZgnAPTntUIwGsUHgPH5IyEYuywfzi7tSRiL0vzkEKiND09Dd9YJAUCnvtbTdh6uLXCKDzA+k/aLyPP6pax5XauLOYYb9n4hcEw41pu0wX4Bs1guBAApLa1thxQfAMbv9iTtzPb9hywX1iYcAozJR4QAmuQJAaCmuTIAFVN8AExkx+/AJO1cLVWd87ol5NS4N6SPSzHGNGjaL4QAoDPnCMH8KT6AhRP98Polx9jQPi0E1TpXCEa2pvL9e6cUm2MCTVskBACdObun7dxQU9AUHwDYXukfcT4tSRxLKzi9Tdeu1plCAFTkeUIAnVK0BMjlsJp2RvEBuremkf00iZ2/LE8/lP4R5/MTxHCl4xU5FjP7ScdaeYLth1INAFAHxQfonvfmMxOvX6qzXdu7V1cHoGOeYANqn0MDlO42IZifXYQAWOAkdkIYYBs+Mt2vTRHx5Yi4PyLui4jvRcRzImJ5RPx6RLxy8z8bk5mqtRtwLo2Id0g7xjMAgAU5qKc19kci4gM1BEzxAbpfKMFsJpL0ldIW/hlidrbuPRYHRMS3jdt0aFNj+3tyKD6YYwLGEUU9gCzeH5UUH7x2CWAY/yRJO28qpB3XJYnXOYW15/NJj4+VmxfHW36+PcZtTd3OiyoYW1ygBGqxpxAAAOSm+ECfTq18/05rNK8udI3m/yVp5yGFtOOIBLEq8U6yoxMdE6fH1iLAUN/MeGhKG75lmKrWg87XJHNso/v9iNSDcwEAuS3ktUu1Pa63JCI2FNYmj0Tmcr4QMMIx7vVLdSySvqc7V3eu+63N/3t3PP0kRianRcQFuta0lgkByVwpBDinD3rOeFBqm8j3pBgD8zg2+xgzjo2Iq7IHy5MPQK0TtSwOTtLO/Qba7m5J4vMvHZfzdmCSBdVLEy78FMOZzp8JAeaYMC/rY9tXNLoYDEBfqrgBRfEBLIwY1q1J2nnPQNvdmCA2FqGjxez2hG1eL3XO18mdpAvos0Anc4KJyPuUoXEFgN4oPgDGkzIWMBYqO/qFrlGdP43cxZq94ulvUzheAfrjw9OUasv3qu4XCgDYORcLYeFeJgQREbFJCBbkTCHYwaIEbSz1QvoDBbbpyIh4XwX98oKIONvhmdJFQhARClOZuOj+NB+epnQrwpOwAK3pa9xfnj1Qig+wcHcKAR34cJJ2Tla2nYVYXHDb9i6sPTdHxPUVHa/nRI5XgrGtU4SAZFx0h1wyFSB8yB4gh3XZd0DxAeiSuynbWLBcM+bfvzpJHJ7QZefs0Ar3afcEbVyl6zGNTwsB5pjQ9Hz+WKkCoA+KD2AhRFluTtDGo8b8+9dYWFqE27dOrNX9nK+n8TYhKJ7vHoH5AQCkp/gAGFfKkuUO8clkv7dLRxXevt0cRr26UQiAMVgkBDt4oRCQiAIEQP2WCsHsXCQEuubD0+0sVvZpND9fLLx9JX2L4KgG+sPhhqziHSEEO+VpELL5gRCQzNFCAFC1R83bZ6f4ABbtMKr7Gjym3MU2P19sZD+Pk+qiXScEmGMCA/iC8yMArVN8ACyayzTRWK7fn2Bfr9AtmcZVBbftL6SHGVwmBJhjQrNzek8GAjB2ig8wmruFgMYXK137SII2nqBLMoONhbbrrY3nxYXKmZ0oBMX5GyEAAEjjd4VgZooPMJqVBbXlwCjzIvWzdJNmTA789/vgdUvMZnchYA7jiLGE2fx2QW05utA+u0w3AQAK8dc9bSftTVWKD5Df7YW262dS04ksF6qulCqgMEuEoO6FDGNX6vvqH5QazOcBIAfFB6hnkX6/1FTrlxO08djKjicLRkbxWSEoygYhwByzE9dLDQAAo1B8gNymXhRdYRFdrZ8naed8831TsmMMZvMWIWAOY0mJ48rlUsQMffZIc0wAgGldIgTTU3yA+TlXCCjgIkDJ9p7Hnz1EWqv3NiFgII8LwbwcLwSDe7sQAACk9K6etpPy5gvFB5ifMwtv34EFtmk33abq/G7vgYpOmp56WLhPCwEDWVxQW761k3/3SSkiWZ9YWmCbluk2JPKQEADQIsUHyGtnF0ZL/Pj0RqnqzO1J2jlbYSHDR2BX6G6M6EIhYDu/tZN/9wcJx27anmM+WmA7fXiaTN4nBAC0SPEBLMrJf0EgmwwfgfUBd2PnqN5bWHse0+dAnwUG97dCAFA11xCmofgAOV0/w38r8eK0RXW33pOgjZOJ+4LXLXXvDiGY0aaIuDmefrXfgZv7YFc/ewjvoA6f4b8tLrC9V0pZ8+4zx4Sx8NolgLr19faEddkCo/gAc7O6sPYcKSVN+1iSdl6WMLan615jcUBErGpof+dbINglIg6NiA9HnterGXfm5sYZ/tsTBcbvWF2od3sX1p7fkBIYiyVCAEAHlmdrsOIDzM0aIVgwH57uVoa780/c7v9nuDvxggr6xtJC27U2yivkUp8ThYBkHkjW3vUFtmlv3YgEVgkBAC1SfIB89p/DnynxwrQPT3fv2gRt3FJweE2CttbyuqVHC27bmoh42KFLIyY6+jNDjdu056g5/Jm9Cmz3A1JHAmcJAQAtUnyAfIvwu6SEzd6UpJ3LIuKrhbfRcdWfpeHiJm2cryFbn/2ilMDYvFIIAKrX141Ff5UpKIoPUK/jLbKd3ArxYII27q8rDTIeGBOgzO98fF5amMFB5pgAAIP5nUyNVXyAXMfIfC40f076muGVVv0dV3RPEYIuvDnxuHJggfE8WpdyLpzBbcIFAMBcKD7AzDYJQed8eLp7uwsB28lYUFGEYCGuEAISjnl0a7kQwLycLQQAjJviA9TNh6flGnHLZksR4nGhIKlvjPB39i30WIRM58910kKhzi20XedIDUDaOdIZWQKi+ADT+98WeWBSwGAWx9ZCxMeFgxmUdpH8X4/wd74rjU35b86H0JQzhQCAjp2XpaGKDzC9XxWCsXE35Xi4eMBUF1S0L++MrYWIy6UWeuPD0+NxsBCYYwIAtEDxAXK4egF/1wXptsi3OG1xeqX7dXxsLUS4yMSehbXntZWNSz48Xb97nEthrMxVAGia4gPkmCQeU2GM/6luxkAOEYLqxustPx8UjuY8Ulh7viYlJJtjvrTCGPvwNMzu3woBwNis7Gk7h2UIhuIDtOFDBbbpH6RlbNyJOLOv6AvVOiu2LUa4AEU2Gwtsk7t2mclJBbbJh6cxfs7uv0oPwNjc29N2bsgQDMUH2NFFhbWni4rpH0lrc1YKwU4pzLRlXWxbjFgtJFUp7aJOF+PL7tJatdMKa88bOvgdn5JW2CnfzAGAUHyAnTmlsPbcW3Gs3U2p3/Tpkkb3e4XUP2NNbFuMeLOQwJxcIwSdOL+w9nzZHBPGYrco+5s566UIgL4oPkA73PEt5617V6P7fb/UT+uK2LYYcYqQUIAjC2zTUdKC+QbM2cbC27eXFAGM3ak9bWfP0gOh+ADbqvEVDqVbotuN1UlC0MyxZP8X7qLYthjxPCFxvh7gGLteevVZ54VO7KPb0bP9wlM3ADzt4p6280jpgdhFXwAGtiFcGB2nT0XEJxuPwZO6ASP64Xb/31hFyyYdAyRznz5Lz2NkBr4LB916UAhgZp58gK2OaGAfLcDa1Hred9UF9IOOTH0qYj/hGMx1hbXnNscrs2hhvNBnadVuketpB9+FA6BXig+wVWkXM1paxHk8efyuaHS/XQzZ1s1C0Jl7Ymsh4oPC0avSbhY4yFyJOYwXzo3mmNRln839a6NQADCNq4VA8QFadK0QNOkEISAiDhWCsTgrthYirhQOKnaEEDCDC4SAyp0x5Xx/X8L2uykHoF/H9LSdom+2UHyAMg/Uvx7j735ToTnw4WkLDvsrLjU4NrZemDhFOKo/Xx/kWCVZn719jL/79EJz4DV5zKevfD62fc3i1J/zEu/bXdILwBAUH6BMv9vgPm+Q9l78qJH9fJFUz+j3haAXF8XWCxbU6bYG91l/zu3ABvf5HmnvdXzI/HNPRBxdaW721z0BGILiA7R5x/1SaW/W8xvZz4ekekZ/LgS923Jh43GhGNnJDe7zH0o7yXhiB8rzDiEAGMyPWw+A4gOUd8f9ih628WihuXA3ZT8m7B/iNJjF4WmIUV3a4DH0nwrNxQ26Y8p5zSFyAU36hBAADOa5rc91FB+gPPcLAYzMnV3zowAxLEUIsjpMCFL6ihCAuR4A9Enxgda1/PqLUiei/1y3tBBZAHd26QsZKULMLUaOUTK5W58tjg9P05rThQCAoSk+0LrFFmvF+bEQ6G/2R+wapQjhmMnWX5neSn22OD48TWsuEAIAhqb4AG37vhBQiVuEYMFcmCqHIsS2lgsBpHOzEIB5HQC9jslFvt1F8YGWubAT8WK5cRKsZD9eLZX6Q6XnKa+ii1hXWHtudmw+4ybd0zxmGofKDZjPAdCrxSU2SvEBTBJhhWMH8SzWj8PFstIcKgTPOEQIjOuA4x0ApqP4QKsuE4JnvKLQdu0pNb25XwjYycJVvyjLpP1u3meEIIUPCsEz9iq0XS+TGiqevwFAURQfaNWJhbXnswNu+5uF5ugR3dRixSJrUCsiYqkwFGUyIk4WhkENWbD/vYL7JVudVVh7bhtw2+sLzdGduinm8gD0bFFP2/l6aTuu+ABleIsQMLCMF48sssbvUXEuzqUR8QthGMw3hYBkDhICqJ65GkD5nuppO68sbccVH2iRO/TyTFjlqh8/dSwzhzHCUxDlWNRI/3eM72hxoe3y4Wl91hwTHGMAsAPFBxjei4WAgT07cdtfLn292fIUxEahKIaLZ/0q4QLPE4XGxoeny3SwEIDzEgAMSfGB1ry5wDZ9X1pm5MPT45X94uU3pLB3u1vsOoZ7sEZqSWZ1gW26tZB2lPodr9/UbUnqYnMxgJQO7mk7Hy9ppyc2/ORnUv+0JRGxobA2mVB0r8SLNBPi41gYyB0RcUAl+6KPGDdaN6FfOV+LkZzos031Wedf53uM4/IEc3NJRLxrPn/hLRc8K3sfLmb88OQDmEzQrgMq2pdV0jnoOGYssxBzvgZ9FhifkxzXAGSk+EBLXJiZ3VvlzvGQ1FopHZwixPAuMz41465C29Xq67L02dkdLHewoDnWp4QBgIwUH4Cp/lIImnBZpfvlAkI5C+SJiHi+UPTuRCEYixsLbNP+hcZqte7CNG4VAhh5TgVAPc7paTtvL2WHFR9oRYkfLTaRnJ8XCkFnar5AuZ/0FuNHFs2DyF6EO6PANh2uW5FsPWXcnR+vbqTEY9hxDFCns3vazidNlqFfjwhB+gXrD6SmE7U/HXCPFBe9iLaQdpzP5jzpm7OV+l8RNumK6eeYXt1ICfYyVwKgRooPMIxPCgED+I+N7KfXL5VNIaIfbxOCThxYcNvulR524hYhgDRunjInWi8cANRI8YEWlHgh8g+kpZpcZvKhhvZ1uXSnoBAxPp82xnfidl1pJK18ePrBAtv0at3PHJOiXTxl7nOocAA06baetlPEqyUVH4CdcSHQojq7dVKectzZ8nO/cDjuSX2+buXD08t0QXNMmMWN281xThUSgOYd1NN2ini1pOID9G8vIbDQ79mxje63C695rQhPRbTmNwtsk76HhWxbXi4ELNBt281fJiLicGEBoGWKD9SuxIuP65PErtSPfj6oW8/blQ3v+zLpr8LURfyLhSP9eXBnviVVI3tS37N/m92WJHbvKLRd3zCcsEAKgACwHcUHYDr/QQiq0Prd/4pV9fl+bFuM2F9IaNyuQkAynxACKp533yEM0JS9YscnnvxQkt2GboDiAzW7rsA2GYS7m9gzu1VCoL804K7tJroHC0m6Y6DE9jlfd+O/V7pfH9VnjZcwjQP0IwAKmrttHHpHFR+o2RFCYCHbuLVC8IwXCkEzbo1tixEnCQkNOLrQdr2i0ni/R5czx4RZTEbED4QBgNYpPgBZLROCWRc8bGXx165PxbbFiKuMCczi2oRt/oK0QWdeKQQjG/X1HEdGxM0VxuOFzr8AtE7xgVp5hUP9vMt/es8TgjTjAv07LryP1HE5szdJi7HXHLNpXxeC3l0fEYfG9MWJ9RWMG6+TZgBapPgAWNDW54dCMK09hYCdjHFbfvaqfF9fJd3O16DPktDUD7qemnQfbg43wgAwzFxo0PPPLvJMhU4utF1e+zKeAdTCtaCTSgKP6DPMYP12/aO24+mWwvr/d5yvm7E2Ig6sYD9er8+aYzK4izf/ZD1P61sANEXxgRpdWmi7fPAWLPrIpeZCRAn2db5uxqpK9uNL+iwUd56+PCKONxcFgDJ57RKQ3TIh2GYhw9wsEQLmacvrHnYVCoAmrBaCFE6InBfyJyNiufQBUDvFB2rj4mt7fHha3x/FBiFgRE9G7o9VT2oHcq7PMidrhCCVjOfldRFxvtQBNG1p7XNZxQcAWuVCEguVuQgBADWel7M5LRS6AFr2aO07qPhATTy22q5J+8+IdhMCOjAREWcLw5ydKwTNuiNpu39F6syxSHVOvj1Zm1eHp3IBqJTiAzVZJwRYFDNPG4WAjpwTnoKYqzOFoFkHJG33P0odpHJgRDyUrM1LrGcBqJHiA1CLvYWAESng0KUMBYi10gQwZ68SgpRelLDNyyPiGqkDaM5xPW3nB0PsnOIDtXDxkAf0exbg2UJAh0ovQKwybqEPzJlXoXCLEDgf9+ioiDhC6gCaclVP23nhEDun+ACQk4sh3fqpEIxM4WbnvIIJ6rBECMD5uGfXSRsAtVB8AGrS0h21LoboP+P27s0xme1H4WZ6LxKCbXh1CVvcLQSYI9CjCX0OAIah+IDFAOjz417sZVrw1X5e/KWIuDTmVlS4UNwW7CEh2MYtQsBmK51vgZ69w5wfgIJd0tN2en+6zsUCoDbLK9+/NYna+oYp/3xjkjZvStov9tvcN2YrKGyKiJPFrVdevwRQh9cIQWqfSNpuBQiANryrp+30/l2hXeSW5NYIAdtZF3Vf7FudqK1fnvLPhydaPE0m6UMWo2Siv5JtrL1MitjOV0NBObuJpOejyyPiBOkDICNPPpDdaiGgIdletzSXfwcAJTpRCKBKGeejx0sbAFkpPgA1qvEO20sTtfUSfQi2UeKFjmU9buvZugDTuFsIMD9gAGfqewAU6L6etnNunzul+IDJP+RwcqK2zvSuwkx3mxljxKtm+/S4rZ8KN9Mo9cPTxjOo24fNtQAo0G/0tJ1ei/CKD0CtavrwdPbXLY3yZ4Dx2lcIAEbyOiGoQtb56AelDoBMFB/I6gwhYBbrKtmP0xK19bEK+5E7zKhVXwXah4WaZOPssVLCLG4WgmpkLECcJW0AZKL4QFbnCQGNOD9RW/eodLFXagHiwgLb9KBDNo0lPW1nqVCTzJVCAJibAlC53m64UXwATMy1vwujFBNW6qIL8t4C27RMWtK4SwgoyHeEAHM0Es1h9UEAsp+XervhRvEBEy0o0xsb2Md7jTswmNsdNxSklG+Q6LPQJt8jA4AxUXwAardP0nZf28iCzeuX6iNOOXxbCAAW5DAhqMot5lwA0D3FB7JZJQTM030WEmO1uIPfcaZuCr0b9wfiPy7EJDv37SkFzNMNQlCVVxs7AWjM8j42ovhANmuFgMrtl6y9T3TwOz5sgTeyvQqN0y8cys1fGHintJPMI0IAzfP6JQBaOh+t62Mjig9ACzJd+Lun0ROi1y+NZn2hMVpk2AFKXQBBo3NM5uYc/RAAuqP4gEkV6OOjOHwMv/N+XUB/Ru5p2nJ9FhjY2c69ANAdxQegFaW/zmhJsnjeOIbfucICjwrpKwB1e70QVMfrlwCgI4oPQCtKf53RBguydIu9Ui4qLxIjCvJGIcC4QWO+JARVOt74CcCA9q3l3KH4gIkU6N/zcbF0Feepwtv3bsd2cT4zxt99rUMSxylQgc8Z0wAY0Hdr2RHFB6AlJuMLd2oP2/D0Q10uFILi/J4QULj/JQSYY1IAr18CgAXaRQhI4DsmoxZgYtVcn18UEZsS5XDo8eDfRMTXxcixbZ+dryvJ2a/3tJ3r9Fl9FmZxZMFjhXkXAMXz5AMZ7CsEdKikD09nWkD/qOftPaWrzsvfJlkIt8LFMcjhCCFI50n9iZ5dn7TdfyF1AOmd2tN2xrp+VXyA0biTJG987pGekTxfPxruZF2RSfs4uL8b0+9d4nzkfG280Gd7sGvBbbtOehyXBXmrtAGkV8U3NxUfKJ0LeujbbS+4DpfTOdtDnAa3IUEbf63hfQdzTGBUBxvnAGD+FB+AFifok41vP5MbhWDOHrMYHnyfluiGRfmxEMzJFQW37UHpYSde7PzGAG5N2u7lUgfAkBQfKNm5hbbL4/B1T9Apr797/dLcPSJW9mUAjxfarucawufkhILbtmxMv/dk59zUvi8EOEbnbJ20AaR2dfY1reIDJTtTCBijlw203UwXKUt6r/InEsVtyBy/INlxOBkRZyQfS7xCLWKxUwrJXCoEjNEbhaBqB5qrANCjY7LvgOIDzM//FIJ5KfnuoDsH2ObDyfL3ZEFteYfDqVrnJV0UT1rMF+0kIajmfN3KcbZRN6ymz14rPVW7XQgAYO4UH7DQnJ9/JTUswFKL+uraVOIYlvW1HVku5v9Z5LwYun9j5+tPOeWQrM/uLjVgntzg2AdA5RQfgHG7uuC2TVa6rYU6vOC2Zboz1CJv9LhNFtyurHfU36VrkZgPT7Mzf2wOwID2Tdjma6QNIKUf97Sd/zGOX6r4QIleVWi7jpKakRwjBHFTsvbeWHDb3Bk6NzV8tHQyhi9EPBB1vF5p/Zh+7+X6v3GjJ8s6+j3LC92/9+h+I/mAEDCg7yZss/UsQE7P7Wk7LxnHL1V8oES3FNquL0pNlVb1sI1DEsVjQhs75c7H7uK45ec7Y9zOmu22tXcl8dtrTL/3eF2TZNYV2q6PSU2VflsIquf1SwAwi12EAOhpYl7qRHftmBcOmSb4F+qqY+sDE467zuw7y37dE0+/YuiuiPheRPxqROyz+e+9JHJ9e6UL9zsEmYeD4ukinLEUc8yF+xt9tgl7Rb5Xw+0XEfdKHQB9UHygxIVlqQsbmK+PJmvvexO1tdYL6yzcys0/bxWKiIhY4XzNPNxmjtm7RbodpLY+YZvvcb4EYBqXR8QJXf5Cr10CGN8FiUzvcM64AFmqj1WZV7pzqhBQmYcr3KenpHXBNjn/Yx6tbwI413Si81frKj5QkmcJgYGyIpkm9I8kjfGj+sScuKu2XReP6feeWOj+Pibl1Z+vl0oPO+FpfkrwHCEAgB0pPlCSn1mEM6AuPzx9SrJ9f0HivDk+Z+eu2jaN89i4rNB93kPamYbXhDGkfycETfh7YyMA7EjxAejTawtu29oOf9dFiXJSw4WPt1rkNZFnoD9XGUdJZkXBbbtaepqRcb51k7QBsJ3Tuvxlig+UotR3+N4vNZ36WgP76KJI//5SH6l2QUx5uS51jHuntHfquIr2ZU2h7dqkm5mzU6XFydp7iJQBpNHXK5XP7/KXKT5QilLf4btCapqy0ItqhyXb35ouRruwPjd/JwTVa/VY+C9S35T53LSyutB98J0Cc0zq9IT+CcCYpHylsuID0LeaL4zdkKitv1xh/G+0yJvVrxmCqjbuY+BfCLHzdSF8eJrW5pjoi+O2StoAGAfFB0pQ6p0WR0tNk15eWT+ezs8rzN3hydr7Cwtikh0DpT45o0+T7dx8utQ06VghaEq2c9NaKQNgitd19YsUH2B6XxCCsbm24LZ9Y4S/s9xiyL6NYJE4IacwssyvCblA+pqM7ZXSg3EVgAU6uKft3NzVL1J8YGgfF4Imvamy/VmXqK0+KmeRt4WL1fWYqLyvYpwYxRnS1yRPlWAMBaBmt2ZrsOIDQ3uniSIFmhzTny3BVyz0ivO4WCGH9p+R/N8Z/tt5hbZ5kbSZY+I8pY8C0ArFB8BEfHS7ibl97cBisULuKNjBBbftOQnj+ZQuZWyEwq0RAgAi4nld/BLFB4bkrgpKtnoOf2Zjov35Uyk1Hs7AhZp8JhrqnzWMwZndmrDN5piU7HeEwDm7gnUQAMM5p6ft/LCLX6L4APknh4zHbHf8ZLuw8T7HcvE2iBdyNS+7CwHJzseOXSIi/koInLuNrQAswNmZGqv4wFDeKARYhItzD1YmausSfYUCc3SDkJNsbHiZdOF8Bp3wBAQAC6b4wFCuLbRd35cappic578v0SON5/DeSvpcnyYi4jaHf5GGuJh2WKGxeI/uwBRTnxy7Uzhwvsd5vBO+/QDAgik+wLZeLAS9O9xicaxeoIulW+g9XEAbDgp3jZbkOfKxg48JQe+uLrhtSxLEzzHcv32FAGNBc2sfgFb0dcPggs8Dig+YwDC0GwtvX+bHjV3o2OrMRG1dqg+xXQ7+3vmaAhxjjkky3y28fW+WIgBgRAdlaajiA2x1nBCwE1MfN3ZRI68PJ2tvSX1tIiL20IV694pQ/JmpT0LJ4+b2PiA97MQVQuA8ZnwFoHaKD/St5Mfir5IeE/CKJt0uzuWPyQMFteWxzfH7B92ot776zYHbcIo04NzSmT8WAn0WkvfNtVIGwCgUH+jbBiEgoWyFh0VSNq37E7V17wLb9M/ChZxxmigovhdJB4A5Jmy2SggAzFdGofgAT3MxbXjXC0FnnhKCaa1o6SQ/5jHTuCmeztcwu12FYHAXCgHOaVXPSwGcRwqm+ECfHhcCZnCkEDS5iBGj2X2n8Fjqc/XFz8UFnGe686QQDO69hbfvRCkypibyGikDYD4UH+jTYiGAsXqtEFRp3yQL54nw8cy5+P1QtBmVi7hAjS4TAhL5qhAAMB+KD+ACkFzU42tCUG1fy3In+gmx9cL6Jt1shz43ERF/Xng7lxfcNq+vKcchQmBeIxdgXgpAM0Z+m43iAyYoYNHSqmwf5r4jWXt3ibbv8L9+yv5nisE6QwNz8BUhAGslzOUBaOb8MfLbbHaRo2c85oRvMoW+QlOe0t8GO64nG9lP+4DzNeiz9gc5FX/kSZ5olicfAIAhJqNTf65PuA/77mQ/AAAAgM0UHwCAoR0ZO17In4iIqwZu113TtGsiIr4rbQAAADRizSh/yWuXAIBSHbf5Z772jIiXRMRzIuKhiPg/m//350IKAABARYp+Cl/xAQCozaObfwAAAICBeO0SAAAAAADQKcUHAAAAAACgU4oPAAAAAABApxQfAAAAAACATik+AAAAAAAAnVJ8AAAAAAAAOqX4AAAAAAAAdErxAQAAAAAA6JTiAwAAAAAA0CnFBwAAAAAAoFOKDwAAAAAAQKcUHwAAAAAAgE79f3SgJh1bJyqFAAAAAElFTkSuQmCC";

function LogoImage({ height = 22, style = {} }) {
  return (
    <img
      src={LOGO_SRC}
      alt="TaxSaarthi"
      style={{ height, width: "auto", display: "block", ...style }}
    />
  );
}

function Logomark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="1" y="1" width="26" height="26" rx="8" stroke={T.borderStrong} strokeWidth="1" />
      <path d="M9 18.5L14 8.5L19 18.5" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6 15.2H17.4" stroke={T.cyan} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="8.5" r="1.3" fill={T.cyan} />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Product", page: "product" },
  { label: "How it works", page: "how-it-works" },
  { label: "Features", page: "product", anchor: "features" },
  { label: "Pricing", page: "pricing" },
  { label: "About", page: "about" },
];

function NavLink({ label, page, anchor, active, navigate, onClick }) {
  return (
    <a
      href={`#/${page}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(page, anchor);
        if (onClick) onClick();
      }}
      style={{
        color: active ? T.textPrimary : T.textSecondary,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500,
        transition: "color 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = T.textPrimary)}
      onMouseLeave={(e) => (e.currentTarget.style.color = active ? T.textPrimary : T.textSecondary)}
    >
      {label}
    </a>
  );
}

function Navbar({ page, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
        background: scrolled ? "rgba(5,11,24,0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        transition: "all 0.35s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#/home"
          onClick={(e) => { e.preventDefault(); navigate("home"); }}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <LogoImage height={22} />
        </a>

        <nav style={{ display: "flex", gap: 32 }} className="ts-desktop-nav">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.label}
              {...l}
              active={page === l.page && !l.anchor}
              navigate={navigate}
            />
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="ts-desktop-nav">
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: T.textSecondary, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            Sign in
          </a>
          <PrimaryButton small onClick={() => navigate("home", "upload")}>Try TaxSaarthi</PrimaryButton>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="ts-mobile-toggle"
          style={{
            display: "none",
            background: "none",
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 8,
            color: T.textPrimary,
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="ts-mobile-menu" style={{ borderTop: `1px solid ${T.border}`, background: T.bg, padding: "16px 28px" }}>
          {NAV_LINKS.map((l) => (
            <div key={l.label} style={{ padding: "10px 0" }}>
              <NavLink {...l} active={page === l.page && !l.anchor} navigate={navigate} onClick={() => setOpen(false)} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: T.textSecondary, fontSize: 14, alignSelf: "center" }}>Sign in</a>
            <PrimaryButton small onClick={() => { navigate("home", "upload"); setOpen(false); }}>Try TaxSaarthi</PrimaryButton>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .ts-desktop-nav { display: none !important; }
          .ts-mobile-toggle { display: inline-flex !important; }
        }
        @media (min-width: 861px) { .ts-mobile-menu { display: none !important; } }
      `}</style>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* HERO + AGENT TRACE PANEL                                            */
/* ------------------------------------------------------------------ */
const TRACE_STEPS = [
  { label: "Income detected", value: "\u20B914,00,000 / yr, salaried" },
  { label: "Employer NPS identified", value: "\u20B950,000 contribution" },
  { label: "Tax regime evaluated", value: "New regime selected" },
  { label: "Liability calculated", value: "\u20B974,100 estimated" },
  { label: "Optimization scan complete", value: "1 opportunity found" },
];

function HeroPanel() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setVisibleSteps(0);
    setShowResult(false);
    const timers = [];
    TRACE_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleSteps(i + 1), 550 + i * 620));
    });
    timers.push(setTimeout(() => setShowResult(true), 550 + TRACE_STEPS.length * 620 + 300));
    timers.push(setTimeout(() => setCycle((c) => c + 1), 550 + TRACE_STEPS.length * 620 + 6000));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 26,
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 0 4px ${T.accentSoft}` }} />
          <span style={{ ...mono, fontSize: 12.5, color: T.textSecondary, letterSpacing: "0.03em" }}>
            TaxSaarthi &middot; agent trace
          </span>
        </div>
        <span style={{ ...mono, fontSize: 11, color: T.textFaint }}>live simulation</span>
      </div>

      <div
        style={{
          background: T.bgSoft,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <div style={{ ...mono, fontSize: 12, color: T.textFaint, marginBottom: 6 }}>input</div>
        <div style={{ ...sans, fontSize: 13.5, color: T.textPrimary, lineHeight: 1.55 }}>
          &ldquo;I earn \u20B914 lakh annually and my employer contributes \u20B950,000 to NPS.&rdquo;
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 172 }}>
        {TRACE_STEPS.map((step, i) => {
          const on = i < visibleSteps;
          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: on ? 1 : 0.28,
                transform: on ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <CheckCircle2
                size={15}
                color={on ? T.cyan : T.textFaint}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <span style={{ ...sans, fontSize: 13, color: on ? T.textPrimary : T.textFaint, flex: 1 }}>
                {step.label}
              </span>
              <span style={{ ...mono, fontSize: 11.5, color: T.textFaint }}>{on ? step.value : ""}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 18,
          borderTop: `1px solid ${T.border}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          opacity: showResult ? 1 : 0,
          transform: showResult ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div>
          <div style={{ ...mono, fontSize: 11, color: T.textFaint, marginBottom: 4 }}>estimated tax</div>
          <div style={{ ...mono, fontSize: 22, color: T.textPrimary, fontWeight: 500 }}>{fmtINR(74100)}</div>
        </div>
        <div>
          <div style={{ ...mono, fontSize: 11, color: T.textFaint, marginBottom: 4 }}>potential savings</div>
          <div style={{ ...mono, fontSize: 22, color: T.cyan, fontWeight: 500 }}>{fmtINR(10500)}</div>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <ArrowRight size={13} color={T.accent} />
          <span style={{ ...sans, fontSize: 12.5, color: T.textSecondary }}>
            Next action &mdash; increase employer NPS contribution
          </span>
        </div>
      </div>

      <div style={{ marginTop: 14, ...mono, fontSize: 10.5, color: T.textFaint }}>
        Simulated for illustration. Figures are not calculated from live data yet.
      </div>
    </div>
  );
}

function Hero({ navigate }) {
  return (
    <section id="top" style={{ padding: "96px 28px 60px", maxWidth: 1220, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 64,
          alignItems: "center",
        }}
        className="ts-hero-grid"
      >
        <Reveal>
          <Eyebrow>AI tax action agent</Eyebrow>
          <h1
            style={{
              ...serif,
              fontSize: "clamp(38px, 5vw, 60px)",
              lineHeight: 1.06,
              color: T.textPrimary,
              margin: "22px 0 22px",
              letterSpacing: "-0.01em",
              fontWeight: 500,
            }}
          >
            Your taxes.
            <br />
            Handled intelligently.
          </h1>
          <p style={{ ...sans, fontSize: 17, lineHeight: 1.65, color: T.textSecondary, maxWidth: 480, marginBottom: 32 }}>
            TaxSaarthi analyzes your income, calculates your tax liability, identifies optimization
            opportunities, and gives you a clear action plan &mdash; powered by AI.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <PrimaryButton onClick={() => navigate("home", "upload")}>
              Try TaxSaarthi <ArrowRight size={16} />
            </PrimaryButton>
            <GhostButton onClick={() => navigate("how-it-works")}>See how it works</GhostButton>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <HeroPanel />
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ts-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CALCULATE (connected to the real backend)                          */
/* ------------------------------------------------------------------ */

// Backend base URL. Set VITE_API_BASE_URL in .env to point at a deployed
// backend; defaults to the local FastAPI dev server per API_CONTRACT.md.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function AdvanceTaxTable({ schedule }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
      <thead>
        <tr>
          {["Due date", "Cumulative %", "Amount due"].map((h) => (
            <th
              key={h}
              style={{
                ...sans,
                fontSize: 11.5,
                color: T.textFaint,
                textAlign: "left",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${T.border}`,
                padding: "6px 8px",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {schedule.map((row) => (
          <tr key={row.due_date}>
            <td style={{ ...mono, fontSize: 13, color: T.textPrimary, padding: "8px", borderBottom: `1px solid ${T.border}` }}>
              {row.due_date}
            </td>
            <td style={{ ...mono, fontSize: 13, color: T.textSecondary, padding: "8px", borderBottom: `1px solid ${T.border}` }}>
              {row.percent_of_liability}%
            </td>
            <td style={{ ...mono, fontSize: 13, color: T.textPrimary, padding: "8px", borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>
              {fmtINR(row.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultSummary({ result, onReset }) {
  const { breakdown, action_plan } = result;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 12, background: "rgba(56,224,224,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <CheckCircle2 size={20} color={T.cyan} />
        </div>
        <div>
          <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: T.textPrimary }}>Your tax action plan</div>
          <div style={{ ...mono, fontSize: 11, color: T.textFaint }}>Report ID: {result.report_id}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div style={{ background: T.surface2, borderRadius: 10, padding: 14 }}>
          <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginBottom: 4 }}>Taxable income</div>
          <div style={{ ...mono, fontSize: 17, fontWeight: 600, color: T.textPrimary }}>{fmtINR(breakdown.taxable_income)}</div>
        </div>
        <div style={{ background: T.surface2, borderRadius: 10, padding: 14 }}>
          <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginBottom: 4 }}>Net tax payable</div>
          <div style={{ ...mono, fontSize: 17, fontWeight: 600, color: T.amber }}>{fmtINR(breakdown.net_tax_payable)}</div>
        </div>
      </div>

      <div style={{ ...sans, fontSize: 12.5, color: T.textFaint, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
        ITR filing deadline
      </div>
      <div style={{ ...mono, fontSize: 14, color: T.textPrimary, marginBottom: 18 }}>{action_plan.filing_deadline}</div>

      {action_plan.advance_tax_required && action_plan.advance_tax_schedule?.length > 0 && (
        <>
          <div style={{ ...sans, fontSize: 12.5, color: T.textFaint, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Advance tax schedule
          </div>
          <AdvanceTaxTable schedule={action_plan.advance_tax_schedule} />
        </>
      )}

      <div
        style={{
          marginTop: 18, padding: 14, borderRadius: 10, background: "rgba(76,127,255,0.08)",
          border: `1px solid ${T.accentSoft}`, ...sans, fontSize: 13.5, color: T.textSecondary, lineHeight: 1.55,
        }}
      >
        {action_plan.optimization_note}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <PrimaryButton
          small
          onClick={() => window.open(`${API_BASE_URL}${action_plan.report_download_url}`, "_blank")}
        >
          Download PDF report <FileText size={14} />
        </PrimaryButton>
        <button
          onClick={onReset}
          style={{ background: "none", border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 9, padding: "9px 16px", fontSize: 13, cursor: "pointer", ...sans }}
        >
          Calculate another
        </button>
      </div>
    </div>
  );
}

function UploadSection() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [employerNps, setEmployerNps] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const income = Number(annualIncome);
    if (!income || income <= 0) {
      setErrorMsg("Enter your annual income as a positive number.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/tax/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annual_income: income,
          employer_nps_contribution: Number(employerNps) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Something went wrong while calculating tax.");
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "Couldn't reach the backend. Is it running at " + API_BASE_URL + "?"
          : err.message
      );
      setStatus("error");
    }
  };

  return (
    <section id="upload" style={{ padding: "60px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 56, alignItems: "center" }} className="ts-upload-grid">
        <Reveal>
          <Eyebrow>Tax calculation</Eyebrow>
          <h2 style={{ ...serif, fontSize: "clamp(28px,3.4vw,38px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            Calculate your tax action plan
          </h2>
          <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, lineHeight: 1.65, maxWidth: 420 }}>
            Enter your annual income and employer NPS contribution to get your tax
            liability, advance-tax schedule, and a downloadable action-plan report
            under the New Regime.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            style={{
              border: `1.5px dashed ${T.border}`,
              borderRadius: 16,
              background: T.surface,
              padding: 34,
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {status !== "success" && (
              <form onSubmit={handleSubmit}>
                <label style={{ ...sans, fontSize: 12.5, color: T.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Annual income (Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1400000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  style={{
                    width: "100%", marginTop: 6, marginBottom: 16, background: T.surface2,
                    border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 12px",
                    color: T.textPrimary, fontSize: 14.5, ...mono, boxSizing: "border-box",
                  }}
                />

                <label style={{ ...sans, fontSize: 12.5, color: T.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Employer NPS contribution (Rs., optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={employerNps}
                  onChange={(e) => setEmployerNps(e.target.value)}
                  style={{
                    width: "100%", marginTop: 6, marginBottom: 20, background: T.surface2,
                    border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 12px",
                    color: T.textPrimary, fontSize: 14.5, ...mono, boxSizing: "border-box",
                  }}
                />

                {status === "error" && (
                  <div style={{ ...sans, fontSize: 13, color: "#F0876B", marginBottom: 14, lineHeight: 1.5 }}>
                    {errorMsg}
                  </div>
                )}

                <PrimaryButton type="submit" style={{ width: "100%", justifyContent: "center" }} disabled={status === "loading"}>
                  {status === "loading" ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "#fff", animation: "ts-spin 0.8s linear infinite", display: "inline-block" }} />
                      Calculating...
                    </>
                  ) : (
                    <>Calculate my tax</>
                  )}
                </PrimaryButton>
              </form>
            )}

            {status === "success" && result && <ResultSummary result={result} onReset={reset} />}
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes ts-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .ts-upload-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/* FEATURES                                                             */
/* ------------------------------------------------------------------ */
const FEATURES = [
  { icon: Sparkles, title: "AI tax calculation", desc: "Describe your income in natural language and get a detailed tax liability breakdown." },
  { icon: TrendingUp, title: "Tax optimization", desc: "Discover opportunities to reduce your tax liability based on your available options." },
  { icon: ListChecks, title: "Action plan", desc: "Don't just see your tax. Know exactly what to do next." },
  { icon: CalendarClock, title: "Advance tax tracking", desc: "Understand your upcoming advance-tax obligations and payment schedule." },
  { icon: LayoutGrid, title: "Tax breakdown", desc: "See exactly how your taxable income moves through each tax slab." },
  { icon: FileBarChart2, title: "Tax reports", desc: "Generate a clean tax summary and downloadable report." },
  { icon: ScanLine, title: "Document intelligence", desc: "Upload tax PDFs and extract relevant financial information." },
  { icon: Network, title: "Agent orchestration", desc: "TaxSaarthi coordinates specialized AI agents to calculate, analyze and create your action plan." },
];

function FeatureCard({ icon: Icon, title, desc }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      tabIndex={0}
      style={{
        background: T.surface,
        border: `1px solid ${hover ? T.borderStrong : T.border}`,
        borderRadius: 14,
        padding: 22,
        height: "100%",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
        outline: "none",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: T.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={16} color={T.accent} />
      </div>
      <div style={{ ...sans, fontSize: 14.5, fontWeight: 600, color: T.textPrimary, marginBottom: 8 }}>{title}</div>
      <div style={{ ...sans, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function FeaturesTeaser({ navigate }) {
  const preview = FEATURES.slice(0, 4);
  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div>
            <Eyebrow>Capabilities</Eyebrow>
            <h2 style={{ ...serif, fontSize: "clamp(28px,3.4vw,38px)", color: T.textPrimary, margin: "18px 0 0", fontWeight: 500, maxWidth: 560 }}>
              Everything you need to make smarter tax decisions.
            </h2>
          </div>
          <button
            onClick={() => navigate("product", "features")}
            style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, ...sans, paddingBottom: 4 }}
          >
            View all features <ChevronRight size={15} />
          </button>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ts-feature-grid">
        {preview.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 980px) { .ts-feature-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .ts-feature-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function FeaturesFull() {
  return (
    <section id="features" style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto", scrollMarginTop: 90 }}>
      <Reveal>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 style={{ ...serif, fontSize: "clamp(28px,3.4vw,38px)", color: T.textPrimary, margin: "18px 0 40px", fontWeight: 500, maxWidth: 640 }}>
          Everything you need to make smarter tax decisions.
        </h2>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ts-feature-grid">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 980px) { .ts-feature-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .ts-feature-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TAX PREVIEW                                                         */
/* ------------------------------------------------------------------ */
function AnimatedNumber({ value, format = fmtINR, duration = 1100 }) {
  const [n, setN] = useState(0);
  const [ref, shown] = useReveal();
  useEffect(() => {
    if (!shown) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, value, duration]);
  return <span ref={ref}>{format(n)}</span>;
}

function TaxPreview() {
  const rows = [
    { label: "Taxable income", value: 1175000 },
    { label: "Standard deduction", value: 75000 },
    { label: "Employer NPS", value: 50000 },
    { label: "Potential optimization", value: 10500, accent: true },
  ];
  const slabs = [
    { band: "\u20B90 \u2013 4L", rate: "0%" },
    { band: "\u20B94L \u2013 8L", rate: "5%" },
    { band: "\u20B98L \u2013 12L", rate: "10%" },
    { band: "\u20B912L \u2013 16L", rate: "15%" },
    { band: "\u20B916L \u2013 20L", rate: "20%" },
    { band: "Above 20L", rate: "25%+" },
  ];

  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "start" }} className="ts-preview-grid">
        <Reveal>
          <Eyebrow>Your fiscal position</Eyebrow>
          <h2 style={{ ...serif, fontSize: "clamp(26px,3.2vw,34px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            A clear view of where you stand.
          </h2>
          <p style={{ ...sans, fontSize: 15, color: T.textSecondary, lineHeight: 1.65, maxWidth: 380 }}>
            Every number traced back to its source &mdash; income, deductions, and the slabs that
            shaped your final liability.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ ...mono, fontSize: 12, color: T.textFaint, marginBottom: 6 }}>estimated tax payable</div>
            <div style={{ ...mono, fontSize: 40, fontWeight: 500, color: T.textPrimary, marginBottom: 26 }}>
              <AnimatedNumber value={74100} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 26 }}>
              {rows.map((r) => (
                <div key={r.label}>
                  <div style={{ ...sans, fontSize: 12, color: T.textFaint, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ ...mono, fontSize: 17, color: r.accent ? T.cyan : T.textPrimary }}>
                    <AnimatedNumber value={r.value} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
              <div style={{ ...sans, fontSize: 12, color: T.textFaint, marginBottom: 12 }}>tax slab breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slabs.map((s) => (
                  <div key={s.band} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...sans, fontSize: 13, color: T.textSecondary }}>{s.band}</span>
                    <span style={{ ...mono, fontSize: 12.5, color: T.textPrimary }}>{s.rate}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textFaint, marginTop: 18 }}>
              Illustrative figures &mdash; connect a live profile for your actual position.
            </div>
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 900px) { .ts-preview-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HOW IT WORKS                                                        */
/* ------------------------------------------------------------------ */
const STEPS = [
  { n: "01", title: "Tell TaxSaarthi", desc: "Describe your income or upload your tax documents.", detail: "Type a sentence like you would to a person, or drop in a Form 16. No forms to fill first." },
  { n: "02", title: "AI understands", desc: "TaxSaarthi extracts your financial information.", detail: "Income, employer contributions, and existing deductions are parsed and structured automatically." },
  { n: "03", title: "Agents analyze", desc: "Specialized agents calculate your tax and identify opportunities.", detail: "A calculator agent runs deterministic tax math while an action-plan agent scans for optimization." },
  { n: "04", title: "Take action", desc: "Receive a personalized action plan and tax report.", detail: "Get concrete next steps, an advance-tax schedule, and a downloadable summary." },
];

function HowItWorksTeaser({ navigate }) {
  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 44 }}>
          <div>
            <Eyebrow>Process</Eyebrow>
            <h2 style={{ ...serif, fontSize: "clamp(28px,3.4vw,38px)", color: T.textPrimary, margin: "18px 0 0", fontWeight: 500 }}>
              From income to action, in four steps.
            </h2>
          </div>
          <button
            onClick={() => navigate("how-it-works")}
            style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, ...sans, paddingBottom: 4 }}
          >
            See full walkthrough <ChevronRight size={15} />
          </button>
        </div>
      </Reveal>

      <StepsGrid steps={STEPS} withDetail={false} />
    </section>
  );
}

function StepsGrid({ steps, withDetail }) {
  return (
    <div style={{ position: "relative" }}>
      <div className="ts-steps-line" style={{ position: "absolute", top: 20, left: 0, right: 0, height: 1, background: T.border }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }} className="ts-steps-grid">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 130}>
            <div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: T.bg,
                  border: `1px solid ${T.borderStrong}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...mono,
                  fontSize: 12,
                  color: T.accent,
                  marginBottom: 18,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {s.n}
              </div>
              <div style={{ ...sans, fontSize: 15.5, fontWeight: 600, color: T.textPrimary, marginBottom: 8 }}>{s.title}</div>
              <div style={{ ...sans, fontSize: 13.5, color: T.textSecondary, lineHeight: 1.6 }}>{s.desc}</div>
              {withDetail && s.detail && (
                <div style={{ ...sans, fontSize: 12.5, color: T.textFaint, lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  {s.detail}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 780px) {
          .ts-steps-grid { grid-template-columns: 1fr 1fr !important; row-gap: 40px !important; }
          .ts-steps-line { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AGENT ORCHESTRATION (signature)                                     */
/* ------------------------------------------------------------------ */
function NodeBox({ x, y, w, h, title, sub, muted, accentBorder }) {
  const cy = y + h / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={T.surface}
        stroke={accentBorder ? T.accent : T.border}
        strokeWidth={accentBorder ? 1.4 : 1}
      />
      <text
        x={x + w / 2}
        y={sub ? cy - 2 : cy + 4}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize={sub ? 12.5 : 12}
        fontWeight={600}
        fill={muted ? "#8C9AB8" : "#EEF2FA"}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={cy + 14}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize={10}
          fill="#5D6B8A"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function AgentOrchestration() {
  const [ref, shown] = useReveal();
  return (
    <section style={{ padding: "80px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 56px" }}>
          <Eyebrow>Agent orchestration</Eyebrow>
          <h2 style={{ ...serif, fontSize: "clamp(28px,3.6vw,40px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            One question. Multiple intelligent agents.
          </h2>
          <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, lineHeight: 1.65 }}>
            TaxSaarthi coordinates specialized agents that calculate your liability, analyze your
            position, and turn the result into actionable next steps.
          </p>
        </div>
      </Reveal>

      <div ref={ref} style={{ position: "relative" }}>
        <svg viewBox="0 0 900 360" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Diagram of TaxSaarthi coordinator agent directing a calculator agent and an action-plan agent to produce a final response">
          <line x1="450" y1="76" x2="270" y2="164" stroke={T.border} strokeWidth="1.5" />
          <line x1="450" y1="76" x2="630" y2="164" stroke={T.border} strokeWidth="1.5" />
          <line x1="270" y1="200" x2="270" y2="260" stroke={T.border} strokeWidth="1.5" />
          <line x1="630" y1="200" x2="630" y2="260" stroke={T.border} strokeWidth="1.5" />
          <line x1="270" y1="288" x2="450" y2="320" stroke={T.border} strokeWidth="1.5" />
          <line x1="630" y1="288" x2="450" y2="320" stroke={T.border} strokeWidth="1.5" />

          {shown && (
            <>
              <circle r="3.5" fill={T.cyan}>
                <animateMotion dur="2.1s" repeatCount="indefinite" path="M450,76 L270,164" />
              </circle>
              <circle r="3.5" fill={T.cyan}>
                <animateMotion dur="2.1s" repeatCount="indefinite" begin="0.3s" path="M450,76 L630,164" />
              </circle>
              <circle r="3.5" fill={T.accent}>
                <animateMotion dur="2.1s" repeatCount="indefinite" begin="1s" path="M270,200 L270,260" />
              </circle>
              <circle r="3.5" fill={T.accent}>
                <animateMotion dur="2.1s" repeatCount="indefinite" begin="1.3s" path="M630,200 L630,260" />
              </circle>
              <circle r="3.5" fill={T.amber}>
                <animateMotion dur="2.1s" repeatCount="indefinite" begin="1.8s" path="M270,288 L450,320" />
              </circle>
              <circle r="3.5" fill={T.amber}>
                <animateMotion dur="2.1s" repeatCount="indefinite" begin="2.1s" path="M630,288 L450,320" />
              </circle>
            </>
          )}

          <NodeBox x={370} y={28} w={160} h={48} title="TaxSaarthi coordinator" sub="understands intent" />
          <NodeBox x={190} y={164} w={160} h={36} title="Calculator agent" sub="deterministic tax math" />
          <NodeBox x={550} y={164} w={160} h={36} title="Action-plan agent" sub="recommendations" />
          <NodeBox x={190} y={260} w={160} h={28} title="Tax calculation" muted />
          <NodeBox x={550} y={260} w={160} h={28} title="Recommendations" muted />
          <NodeBox x={370} y={320} w={160} h={36} title="Final response" accentBorder />
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* OPTIMIZATION                                                        */
/* ------------------------------------------------------------------ */
function FlowRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ ...sans, fontSize: 13, color: T.textSecondary }}>{label}</span>
      <span style={{ ...mono, fontSize: 22, fontWeight: 500, color: accent ? T.cyan : T.textPrimary }}>
        <AnimatedNumber value={value} />
      </span>
    </div>
  );
}

function Optimization() {
  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="ts-opt-grid">
        <Reveal>
          <Eyebrow>Optimization</Eyebrow>
          <h2 style={{ ...serif, fontSize: "clamp(26px,3.2vw,36px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            Your tax bill isn&rsquo;t the end of the story.
          </h2>
          <p style={{ ...sans, fontSize: 15, color: T.textSecondary, lineHeight: 1.65, maxWidth: 400, marginBottom: 26 }}>
            TaxSaarthi looks past the number on the page and surfaces the specific moves available
            to you &mdash; explained plainly, with the impact attached.
          </p>
          <GhostButton>Explore optimization <ChevronRight size={15} /></GhostButton>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <FlowRow label="Current estimated tax" value={74100} />
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
              <ArrowRight size={16} color={T.textFaint} style={{ transform: "rotate(90deg)" }} />
            </div>
            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 16,
                background: T.bgSoft,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <TrendingUp size={14} color={T.cyan} />
                <span style={{ ...sans, fontSize: 12.5, color: T.cyan, fontWeight: 600 }}>Potential optimization</span>
              </div>
              <div style={{ ...sans, fontSize: 13.5, color: T.textPrimary }}>Additional employer NPS contribution</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 16px" }}>
              <ArrowRight size={16} color={T.textFaint} style={{ transform: "rotate(90deg)" }} />
            </div>
            <FlowRow label="Potential savings" value={10500} accent />
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 900px) { .ts-opt-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ADVANCE TAX                                                         */
/* ------------------------------------------------------------------ */
const QUARTERS = [
  { q: "Q1", date: "Jun 15", status: "Paid", pct: "15%", amount: 11115 },
  { q: "Q2", date: "Sep 15", status: "Paid", pct: "45%", amount: 33345 },
  { q: "Q3", date: "Dec 15", status: "Upcoming", pct: "75%", amount: 55575 },
  { q: "Q4", date: "Mar 15", status: "Upcoming", pct: "100%", amount: 74100 },
];

function AdvanceTax() {
  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <Eyebrow>Advance tax</Eyebrow>
        <h2 style={{ ...serif, fontSize: "clamp(26px,3.2vw,36px)", color: T.textPrimary, margin: "18px 0 40px", fontWeight: 500 }}>
          Know what&rsquo;s due, and when.
        </h2>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="ts-adv-grid">
        {QUARTERS.map((q, i) => (
          <Reveal key={q.q} delay={i * 90}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ ...mono, fontSize: 12, color: T.textFaint }}>{q.date}</span>
                <span
                  style={{
                    ...sans,
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: q.status === "Paid" ? "#7CE3C6" : T.amber,
                    background: q.status === "Paid" ? "rgba(76,224,180,0.1)" : "rgba(232,179,76,0.1)",
                  }}
                >
                  {q.status}
                </span>
              </div>
              <div style={{ ...serif, fontSize: 22, color: T.textPrimary, marginBottom: 10 }}>{q.q}</div>
              <div style={{ height: 4, borderRadius: 4, background: T.border, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: q.pct, background: q.status === "Paid" ? "#4CE0B4" : T.accent }} />
              </div>
              <div style={{ ...mono, fontSize: 15, color: T.textPrimary }}>{fmtINR(q.amount)}</div>
              <div style={{ ...sans, fontSize: 11, color: T.textFaint, marginTop: 2 }}>cumulative, {q.pct}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`@media (max-width: 780px) { .ts-adv-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TRUST                                                                */
/* ------------------------------------------------------------------ */
const TRUST = [
  { icon: Eye, title: "Transparent calculations", desc: "Every figure traces back to the input and rule that produced it." },
  { icon: MessageSquareText, title: "Explainable recommendations", desc: "Optimization suggestions come with plain-language reasoning." },
  { icon: Lock, title: "Secure document handling", desc: "Uploaded documents are processed for extraction, not stored openly." },
  { icon: UserCog, title: "User-controlled actions", desc: "TaxSaarthi recommends. You decide what to act on." },
];

function Trust() {
  return (
    <section style={{ padding: "70px 28px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <Eyebrow>Trust</Eyebrow>
        <h2 style={{ ...serif, fontSize: "clamp(26px,3.2vw,36px)", color: T.textPrimary, margin: "18px 0 40px", fontWeight: 500, maxWidth: 560 }}>
          Built for clarity. Designed for responsible decisions.
        </h2>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="ts-trust-grid">
        {TRUST.map((t, i) => (
          <Reveal key={t.title} delay={i * 80}>
            <div>
              <t.icon size={18} color={T.accent} style={{ marginBottom: 12 }} />
              <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>{t.title}</div>
              <div style={{ ...sans, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div
          style={{
            marginTop: 40,
            padding: "16px 20px",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            background: T.surface,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <ShieldCheck size={16} color={T.textFaint} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ ...sans, fontSize: 12.5, color: T.textSecondary, lineHeight: 1.6, margin: 0 }}>
            TaxSaarthi provides informational and planning assistance. Users should verify tax
            calculations and recommendations against official government guidance or a qualified
            tax professional before filing.
          </p>
        </div>
      </Reveal>

      <style>{`
        @media (max-width: 900px) { .ts-trust-grid { grid-template-columns: 1fr 1fr !important; row-gap: 28px !important; } }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PRICING                                                             */
/* ------------------------------------------------------------------ */
const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    tagline: "For getting a first read on your taxes.",
    features: [
      { label: "Natural-language tax estimate", included: true },
      { label: "1 document upload / month", included: true },
      { label: "Basic tax slab breakdown", included: true },
      { label: "Optimization recommendations", included: false },
      { label: "Advance tax tracking", included: false },
      { label: "Downloadable reports", included: false },
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Plus",
    price: 299,
    period: "per month, billed annually",
    tagline: "For individuals who want to act on their taxes.",
    features: [
      { label: "Everything in Free", included: true },
      { label: "Unlimited document uploads", included: true },
      { label: "Optimization recommendations", included: true },
      { label: "Advance tax tracking", included: true },
      { label: "Downloadable reports", included: true },
      { label: "Priority support", included: true },
    ],
    cta: "Try TaxSaarthi",
    featured: true,
  },
  {
    name: "Business",
    price: 1499,
    period: "per month, billed annually",
    tagline: "For tax professionals managing multiple clients.",
    features: [
      { label: "Everything in Plus", included: true },
      { label: "Multi-client management", included: true },
      { label: "Agent API access", included: true },
      { label: "Dedicated onboarding", included: true },
      { label: "Custom integrations", included: true },
      { label: "Priority support", included: true },
    ],
    cta: "Talk to us",
    featured: false,
  },
];

function PricingCard({ plan, navigate }) {
  return (
    <div
      style={{
        background: plan.featured ? T.surface2 : T.surface,
        border: `1px solid ${plan.featured ? T.accent : T.border}`,
        borderRadius: 16,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100%",
      }}
    >
      {plan.featured && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 28,
            background: T.accent,
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 999,
            ...sans,
          }}
        >
          Most popular
        </div>
      )}
      <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>{plan.name}</div>
      <div style={{ ...sans, fontSize: 13, color: T.textSecondary, marginBottom: 20, lineHeight: 1.5, minHeight: 40 }}>
        {plan.tagline}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ ...mono, fontSize: 34, fontWeight: 500, color: T.textPrimary }}>{fmtINR(plan.price)}</span>
      </div>
      <div style={{ ...mono, fontSize: 11.5, color: T.textFaint, marginBottom: 24 }}>{plan.period}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26, flex: 1 }}>
        {plan.features.map((f) => (
          <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {f.included ? (
              <Check size={15} color={T.cyan} style={{ flexShrink: 0, marginTop: 2 }} />
            ) : (
              <Minus size={15} color={T.textFaint} style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <span style={{ ...sans, fontSize: 13, color: f.included ? T.textSecondary : T.textFaint }}>{f.label}</span>
          </div>
        ))}
      </div>

      {plan.featured ? (
        <PrimaryButton style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("home", "upload")}>
          {plan.cta}
        </PrimaryButton>
      ) : (
        <GhostButton style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("home", "upload")}>
          {plan.cta}
        </GhostButton>
      )}
    </div>
  );
}

function PricingPage({ navigate }) {
  return (
    <div>
      <section style={{ padding: "80px 28px 20px", maxWidth: 1220, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Eyebrow>Pricing</Eyebrow>
          <h1 style={{ ...serif, fontSize: "clamp(32px,4.4vw,48px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            Plans that grow with your tax needs.
          </h1>
          <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, maxWidth: 480, margin: "0 auto" }}>
            Start free with an estimate. Upgrade when you want optimization, tracking, and reports.
          </p>
        </Reveal>
      </section>

      <section style={{ padding: "40px 28px 30px", maxWidth: 1220, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ts-pricing-grid">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <PricingCard plan={p} navigate={navigate} />
            </Reveal>
          ))}
        </div>
        <style>{`@media (max-width: 900px) { .ts-pricing-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      <section style={{ padding: "40px 28px 90px", maxWidth: 820, margin: "0 auto" }}>
        <Reveal>
          <div style={{ ...mono, fontSize: 11, color: T.textFaint, textAlign: "center" }}>
            Prices shown are illustrative for this preview and subject to change at launch. GST as applicable.
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE: HOME                                                          */
/* ------------------------------------------------------------------ */
function HomePage({ navigate }) {
  return (
    <div>
      <Hero navigate={navigate} />
      <UploadSection />
      <FeaturesTeaser navigate={navigate} />
      <TaxPreview />
      <HowItWorksTeaser navigate={navigate} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE: PRODUCT                                                       */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* PRODUCT HERO — ANIMATED VISUAL (fills the blank right-side space)   */
/* ------------------------------------------------------------------ */
function ProductHeroVisual() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto" }}>
      <style>{`
        @keyframes tsph-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes tsph-pulse { 0%,100% { opacity:.5; transform: scale(1); } 50% { opacity:1; transform: scale(1.15); } }
        @keyframes tsph-flow { to { stroke-dashoffset: -24; } }
        @keyframes tsph-glow { 0%,100% { opacity:.35; } 50% { opacity:.7; } }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.accentSoft} 0%, transparent 70%)`,
          filter: "blur(30px)",
          animation: "tsph-glow 4s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 30px 70px -25px rgba(0,0,0,0.55)",
          animation: "tsph-float 6s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 0 4px ${T.accentSoft}` }} />
          <span style={{ ...mono, fontSize: 11.5, color: T.textFaint, letterSpacing: "0.04em" }}>agents at work</span>
        </div>

        <svg viewBox="0 0 380 220" width="100%" height="auto" style={{ overflow: "visible" }}>
          <path d="M190 60 C 140 100, 110 120, 80 150" stroke={T.border} strokeWidth="2" fill="none" />
          <path d="M190 60 C 240 100, 270 120, 300 150" stroke={T.border} strokeWidth="2" fill="none" />
          <path
            d="M190 60 C 140 100, 110 120, 80 150"
            stroke={T.cyan}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 10"
            style={{ animation: "tsph-flow 1.4s linear infinite" }}
          />
          <path
            d="M190 60 C 240 100, 270 120, 300 150"
            stroke={T.accent}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 10"
            style={{ animation: "tsph-flow 1.4s linear infinite" }}
          />

          <circle cx="190" cy="50" r="26" fill={T.surface2} stroke={T.borderStrong} />
          <circle
            cx="190"
            cy="50"
            r="26"
            fill="none"
            stroke={T.accent}
            strokeWidth="1.4"
            opacity="0.5"
            style={{ transformOrigin: "190px 50px", animation: "tsph-pulse 2.2s ease-in-out infinite" }}
          />
          <text x="190" y="55" textAnchor="middle" fill={T.textPrimary} fontSize="10" fontFamily="'IBM Plex Mono', monospace">coordinator</text>

          <circle cx="70" cy="165" r="34" fill={T.surface2} stroke={T.borderStrong} />
          <text x="70" y="162" textAnchor="middle" fill={T.textPrimary} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">calculator</text>
          <text x="70" y="176" textAnchor="middle" fill={T.cyan} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">agent</text>

          <circle cx="310" cy="165" r="34" fill={T.surface2} stroke={T.borderStrong} />
          <text x="310" y="162" textAnchor="middle" fill={T.textPrimary} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">action-plan</text>
          <text x="310" y="176" textAnchor="middle" fill={T.accent} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">agent</text>
        </svg>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textFaint, marginBottom: 4 }}>estimated tax</div>
            <div style={{ ...mono, fontSize: 19, color: T.textPrimary, fontWeight: 500 }}>{fmtINR(74100)}</div>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textFaint, marginBottom: 4 }}>potential savings</div>
            <div style={{ ...mono, fontSize: 19, color: T.cyan, fontWeight: 500 }}>{fmtINR(10500)}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: -14,
          right: -14,
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
          animation: "tsph-float 5s ease-in-out infinite 0.5s",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber }} />
        <span style={{ ...sans, fontSize: 11.5, color: T.textSecondary }}>3 agents synced</span>
      </div>
    </div>
  );
}

function ProductPage({ navigate }) {
  return (
    <div>
      <section style={{ padding: "80px 28px 10px", maxWidth: 1220, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }} className="ts-product-hero-grid">
          <Reveal>
            <Eyebrow>Product</Eyebrow>
            <h1 style={{ ...serif, fontSize: "clamp(32px,4.4vw,48px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500, maxWidth: 640 }}>
              An agent system built to act on your taxes, not just explain them.
            </h1>
            <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, maxWidth: 480, lineHeight: 1.65 }}>
              Every capability below is coordinated by the same underlying agent architecture &mdash;
              see how it fits together on the <button onClick={() => navigate("how-it-works")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: 0, fontSize: "inherit", ...sans, textDecoration: "underline" }}>how it works</button> page.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ProductHeroVisual />
          </Reveal>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .ts-product-hero-grid { grid-template-columns: 1fr !important; }
            .ts-product-hero-grid > div:last-child { margin-top: 36px; }
          }
        `}</style>
      </section>
      <FeaturesFull />
      <TaxPreview />
      <AgentOrchestration />
      <Optimization />
      <AdvanceTax />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE: HOW IT WORKS                                                  */
/* ------------------------------------------------------------------ */
function HowItWorksPage({ navigate }) {
  return (
    <div>
      <section style={{ padding: "80px 28px 20px", maxWidth: 1220, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h1 style={{ ...serif, fontSize: "clamp(32px,4.4vw,48px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
            From income to action, in four steps.
          </h1>
          <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            No forms first. Describe your income or upload a document, and TaxSaarthi&rsquo;s
            agents take it from there.
          </p>
        </Reveal>
      </section>

      <section style={{ padding: "50px 28px 20px", maxWidth: 1220, margin: "0 auto" }}>
        <StepsGrid steps={STEPS} withDetail />
      </section>

      <section style={{ padding: "50px 28px", maxWidth: 1220, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="ts-hiw-grid">
          <Reveal>
            <Eyebrow>See it in action</Eyebrow>
            <h2 style={{ ...serif, fontSize: "clamp(24px,3vw,32px)", color: T.textPrimary, margin: "18px 0 14px", fontWeight: 500 }}>
              Watch the agents reason in real time.
            </h2>
            <p style={{ ...sans, fontSize: 15, color: T.textSecondary, lineHeight: 1.65, maxWidth: 400, marginBottom: 26 }}>
              This is the same trace a coordinator agent produces when it hands work to the
              calculator and action-plan agents.
            </p>
            <PrimaryButton onClick={() => navigate("home", "upload")}>Try it yourself <ArrowRight size={16} /></PrimaryButton>
          </Reveal>
          <Reveal delay={100}>
            <HeroPanel />
          </Reveal>
        </div>
        <style>{`@media (max-width: 900px) { .ts-hiw-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      <AgentOrchestration />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE: ABOUT                                                         */
/* ------------------------------------------------------------------ */
function AboutPage({ navigate }) {
  return (
    <div>
      <section style={{ padding: "80px 28px 10px", maxWidth: 900, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h1 style={{ ...serif, fontSize: "clamp(32px,4.4vw,48px)", color: T.textPrimary, margin: "18px 0 20px", fontWeight: 500 }}>
            Built to act, not just to advise.
          </h1>
          <p style={{ ...sans, fontSize: 16, color: T.textSecondary, lineHeight: 1.75, marginBottom: 18 }}>
            Most tax tools stop at a number. They tell you what you owe and leave the deciding,
            the optimizing, and the filing entirely to you. TaxSaarthi exists to close that gap
            &mdash; between knowing your tax position and actually doing something about it.
          </p>
          <p style={{ ...sans, fontSize: 16, color: T.textSecondary, lineHeight: 1.75, marginBottom: 18 }}>
            Under the surface, TaxSaarthi isn&rsquo;t a single model answering questions. It&rsquo;s
            a coordinator agent that understands what you&rsquo;re asking, and hands the work to
            specialized agents built for one job each &mdash; a calculator agent for deterministic
            tax math, and an action-plan agent for turning a number into next steps. Read more on
            the <button onClick={() => navigate("how-it-works")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: 0, fontSize: "inherit", ...sans, textDecoration: "underline" }}>how it works</button> page.
          </p>
          <p style={{ ...sans, fontSize: 16, color: T.textSecondary, lineHeight: 1.75 }}>
            We&rsquo;re building for Indian taxpayers first &mdash; salaried individuals navigating
            regime choices and employer benefits, and the professionals who advise them.
          </p>
        </Reveal>
      </section>

      <Trust />

      <section style={{ padding: "20px 28px 90px", maxWidth: 1220, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <PrimaryButton onClick={() => navigate("home", "upload")}>Try TaxSaarthi <ArrowRight size={16} /></PrimaryButton>
        </Reveal>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CTA + FOOTER                                                        */
/* ------------------------------------------------------------------ */
function CTA({ navigate }) {
  return (
    <section style={{ padding: "40px 28px 90px", maxWidth: 1220, margin: "0 auto" }}>
      <Reveal>
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "64px 40px",
            textAlign: "center",
            background: `radial-gradient(ellipse at 50% 0%, ${T.accentSoft} 0%, ${T.surface} 60%)`,
          }}
        >
          <h2 style={{ ...serif, fontSize: "clamp(28px,4vw,42px)", color: T.textPrimary, margin: "0 0 16px", fontWeight: 500 }}>
            Turn your tax data into action.
          </h2>
          <p style={{ ...sans, fontSize: 15.5, color: T.textSecondary, marginBottom: 30, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
            Describe your income or upload a document &mdash; TaxSaarthi takes it from there.
          </p>
          <PrimaryButton onClick={() => navigate("home", "upload")}>Try TaxSaarthi <ArrowRight size={16} /></PrimaryButton>
        </div>
      </Reveal>
    </section>
  );
}

function FooterLink({ label, page, anchor, navigate }) {
  return (
    <a
      href={`#/${page}`}
      onClick={(e) => { e.preventDefault(); navigate(page, anchor); }}
      style={{ ...sans, fontSize: 13.5, color: T.textSecondary, textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = T.textPrimary)}
      onMouseLeave={(e) => (e.currentTarget.style.color = T.textSecondary)}
    >
      {label}
    </a>
  );
}

function Footer({ navigate }) {
  const cols = [
    [
      { label: "Product", page: "product" },
      { label: "Features", page: "product", anchor: "features" },
      { label: "How it works", page: "how-it-works" },
    ],
    [
      { label: "Pricing", page: "pricing" },
      { label: "About", page: "about" },
      { label: "Dashboard", page: "home", anchor: "upload" },
    ],
    [
      { label: "Privacy", page: "about" },
      { label: "Terms", page: "about" },
      { label: "Contact", page: "about" },
    ],
  ];
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: "48px 28px" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
        <div style={{ maxWidth: 260 }}>
          <a
            href="#/home"
            onClick={(e) => { e.preventDefault(); navigate("home"); }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, textDecoration: "none" }}
          >
            <LogoImage height={19} />
          </a>
          <p style={{ ...sans, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>Your AI tax action agent.</p>
        </div>
        <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
          {cols.map((col, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.map((l) => (
                <FooterLink key={l.label} {...l} navigate={navigate} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1220, margin: "36px auto 0", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
        <span style={{ ...mono, fontSize: 11.5, color: T.textFaint }}>Built for the future of agentic AI.</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* APP                                                                  */
/* ------------------------------------------------------------------ */
export default function App() {
  const { page, navigate } = useRouter();

  let content;
  if (page === "product") content = <ProductPage navigate={navigate} />;
  else if (page === "how-it-works") content = <HowItWorksPage navigate={navigate} />;
  else if (page === "pricing") content = <PricingPage navigate={navigate} />;
  else if (page === "about") content = <AboutPage navigate={navigate} />;
  else content = <HomePage navigate={navigate} />;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", ...sans }}>
      <style>{FONTS}</style>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
        ::selection { background: ${T.accentSoft}; color: #fff; }
      `}</style>
      <Navbar page={page} navigate={navigate} />
      {content}
      <CTA navigate={navigate} />
      <Footer navigate={navigate} />
    </div>
  );
}
