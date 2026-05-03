// AdminEmailsAPI.jsx — Onglets dashboard admin :
//   • Emailings (Resend) : campagnes newsletter, transactionnels, dashboard
//   • API & Connexions : doc API publique vers the99coinproject.org

const AdminEmailsAPI_T = () => window.T;

// ════════════════════════════════════════════════════════════
//   PANEL EMAILINGS (Resend)
// ════════════════════════════════════════════════════════════
function EmailingsPanel() {
  const T = window.T;
  const [view, setView] = React.useState('overview');
  const [composing, setComposing] = React.useState(false);

  const stats = [
    { label: 'Abonné·es newsletter', value: '10 583', trend: '+234 ce mois', color: '#16A34A', icon: '👥' },
    { label: 'Taux d\'ouverture moyen', value: '47,3%', trend: '+2,1 pts', color: '#7C3AED', icon: '📬' },
    { label: 'Taux de clic moyen', value: '8,9%', trend: '+0,8 pts', color: '#E11D74', icon: '🖱️' },
    { label: 'Désabonnements (30 j)', value: '127', trend: '0,12% du total', color: '#F59E0B', icon: '✋' },
    { label: 'Emails transactionnels (30 j)', value: '42 814', trend: 'délivrés à 99,2%', color: '#0891B2', icon: '⚡' },
    { label: 'Quota Resend', value: '63%', trend: '32 100 / 50 000', color: '#0891B2', icon: '📊' },
  ];

  const campaigns = [
    { id:1, name:'Newsletter hebdo · Sem. 17', subject:'✊ La voix des 99% — Cette semaine en mobilisation', segment:'Tous abonné·es', sent:10421, opened:5183, clicked:892, status:'sent', date:'2026-04-22' },
    { id:2, name:'Appel à mobilisation 1er Mai', subject:'1er Mai 2026 — Soyons des centaines de milliers dans la rue', segment:'Région IDF + actifs militants', sent:4203, opened:2987, clicked:1410, status:'sent', date:'2026-04-20' },
    { id:3, name:'Lancement service Sondages', subject:'🆕 Donnez votre voix — Sondages citoyens disponibles', segment:'Tous abonné·es', sent:0, opened:0, clicked:0, status:'draft', date:'2026-04-25' },
    { id:4, name:'Récap mensuel T99CP avril', subject:'Avril en T99CP : 12 450 unités échangées', segment:'Détenteur·rices T99CP', sent:0, opened:0, clicked:0, status:'scheduled', date:'2026-05-01' },
    { id:5, name:'Pétition retraites — relance', subject:'⏰ Plus que 3 jours pour signer', segment:'Non-signataires pétition #7', sent:8124, opened:4289, clicked:1837, status:'sent', date:'2026-04-18' },
  ];

  const transactional = [
    { id:'tx_signup',          name:'Bienvenue sur Maintenant!',           trigger:'Inscription validée',                lastEdit:'2026-03-12', sent7d:184,  opened:'78%', status:'active'   },
    { id:'tx_petition_signed', name:'Confirmation de signature',           trigger:'Signature pétition',                  lastEdit:'2026-02-28', sent7d:2148, opened:'62%', status:'active'   },
    { id:'tx_t99cp_received',  name:'T99CP reçus sur votre wallet',         trigger:'Crédit Polygon',                      lastEdit:'2026-04-04', sent7d:412,  opened:'89%', status:'active'   },
    { id:'tx_t99cp_payout',    name:'Versement mensuel T99CP',              trigger:'Versement contributeur',              lastEdit:'2026-04-01', sent7d:5,    opened:'100%',status:'active'   },
    { id:'tx_password_reset',  name:'Réinitialisation mot de passe',         trigger:'Demande oubli MdP',                   lastEdit:'2026-01-10', sent7d:67,   opened:'95%', status:'active'   },
    { id:'tx_event_reminder',  name:'Rappel mobilisation J-1',              trigger:'Veille d\'un évènement',              lastEdit:'2026-03-22', sent7d:1893, opened:'71%', status:'active'   },
    { id:'tx_marketplace_sale',name:'Votre article a trouvé acquéreur',     trigger:'Vente marketplace',                   lastEdit:'2026-03-15', sent7d:104,  opened:'88%', status:'active'   },
    { id:'tx_sel_request',     name:'Demande de service SEL reçue',          trigger:'Réservation SEL',                     lastEdit:'2026-04-10', sent7d:78,   opened:'82%', status:'active'   },
    { id:'tx_donation_thanks', name:'Merci pour votre don',                  trigger:'Cagnotte abondée',                    lastEdit:'2026-02-15', sent7d:319,  opened:'76%', status:'active'   },
    { id:'tx_poll_result',     name:'Résultat sondage disponible',           trigger:'Clôture d\'un sondage',               lastEdit:'2026-04-25', sent7d:0,    opened:'—',   status:'draft'    },
    { id:'tx_poll_confirm',    name:'🔬 Confirmation de vote sondage',        trigger:'Vote sur un sondage',                 lastEdit:'2026-05-03', sent7d:1284, opened:'92%', status:'active'   },
    { id:'tx_poll_profile',    name:'🔬 Question de profil scientifique',     trigger:'Confirmation de vote (post-clic)',     lastEdit:'2026-05-03', sent7d:0,    opened:'—',   status:'active'   },
  ];

  const segments = [
    { name:'Tous abonné·es',                        count:10583, desc:'Toute la base newsletter' },
    { name:'Région IDF',                             count:3204,  desc:'Île-de-France' },
    { name:'Actifs militants',                       count:1840,  desc:'≥ 3 actions ce mois' },
    { name:'Détenteur·rices T99CP',                   count:946,   desc:'Wallet Polygon créé' },
    { name:'Adhérent·es Confédération',              count:412,   desc:'Communes Libres' },
    { name:'Non-engagé·es 30 j',                     count:2104,  desc:'Aucune ouverture récente — relance' },
  ];

  const statusBadge = (s) => {
    const map = {
      sent:      { label:'Envoyée', color:'green' },
      draft:     { label:'Brouillon', color:'gray' },
      scheduled: { label:'Programmée', color:'amber' },
      active:    { label:'Actif', color:'green' },
    };
    const m = map[s] || { label:s, color:'gray' };
    return <Badge color={m.color} style={{ fontSize:10 }}>{m.label}</Badge>;
  };

  return (
    <div>
      {/* Resend banner */}
      <div style={{ background:'linear-gradient(135deg,#000 0%,#1F2937 100%)', borderRadius:14, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, color:'#fff' }}>
        <div style={{ width:44, height:44, borderRadius:10, background:'rgba(255,255,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📧</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, marginBottom:2 }}>Connecté à Resend</div>
          <div style={{ fontSize:12, opacity:0.75 }}>Domaine vérifié : <code style={{ background:'rgba(255,255,255,0.1)', padding:'1px 6px', borderRadius:4 }}>maintenant.org</code> · DKIM ✓ · SPF ✓ · DMARC ✓</div>
        </div>
        <Btn variant="white" size="sm" onClick={()=>alert('Ouvrir le dashboard Resend\n→ resend.com/dashboard')}>↗ Resend</Btn>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:4, background:T.surface2, borderRadius:12, padding:4, marginBottom:20, flexWrap:'wrap' }}>
        {[['overview','📊 Vue d\'ensemble'],['campaigns','📨 Campagnes'],['transactional','⚡ Transactionnels'],['segments','👥 Segments'],['domain','🔐 Domaine & DNS']].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)} style={{ padding:'8px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', background:view===id?'#fff':'transparent', color:view===id?T.brand:T.text3, boxShadow:view===id?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>{label}</button>
        ))}
      </div>

      {/* Vue d'ensemble */}
      {view === 'overview' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
            {stats.map(s=>(
              <Card key={s.label} style={{ padding:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                  <span style={{ fontSize:11, fontWeight:600, color:T.text3 }}>{s.label}</span>
                </div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:T.text3, marginTop:3 }}>{s.trend}</div>
              </Card>
            ))}
          </div>

          {/* Activité récente emails */}
          <Card style={{ padding:'18px 22px' }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text1, margin:'0 0 14px' }}>Dernières campagnes envoyées</h3>
            {campaigns.filter(c=>c.status==='sent').slice(0,3).map((c,i)=>{
              const openRate = ((c.opened/c.sent)*100).toFixed(1);
              const clickRate = ((c.clicked/c.sent)*100).toFixed(1);
              return (
                <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:18, padding:'12px 0', borderBottom:i<2?`1px solid ${T.border}`:'none', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:T.text1 }}>{c.name}</div>
                    <div style={{ fontSize:11, color:T.text3, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:380 }}>« {c.subject} »</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:T.text1 }}>{c.sent.toLocaleString('fr-FR')}</div>
                    <div style={{ fontSize:10, color:T.text3 }}>envoyés</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:'#16A34A' }}>{openRate}%</div>
                    <div style={{ fontSize:10, color:T.text3 }}>ouvert</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:'#7C3AED' }}>{clickRate}%</div>
                    <div style={{ fontSize:10, color:T.text3 }}>cliqué</div>
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {/* Campagnes */}
      {view === 'campaigns' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:10, flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:T.text1, margin:0 }}>Campagnes & Newsletters</h2>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="outline" size="sm">📥 Importer</Btn>
              <Btn variant="gradient" size="sm" onClick={()=>setComposing(true)}>+ Nouvelle campagne</Btn>
            </div>
          </div>

          {composing && <ComposeCampaign onClose={()=>setComposing(false)} segments={segments} />}

          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${T.border}`, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:T.surface2 }}>
                {['Campagne','Segment','Envoyés','Ouvert','Cliqué','Statut','Date','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {campaigns.map(c=>{
                  const openRate = c.sent ? ((c.opened/c.sent)*100).toFixed(1) : '—';
                  const clickRate = c.sent ? ((c.clicked/c.sent)*100).toFixed(1) : '—';
                  return (
                    <tr key={c.id} style={{ borderTop:`1px solid ${T.border}` }} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', maxWidth:280 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:T.text1 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:T.text3, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>« {c.subject} »</div>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:T.text3 }}>{c.segment}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:T.text1 }}>{c.sent ? c.sent.toLocaleString('fr-FR') : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#16A34A' }}>{openRate !== '—' ? `${openRate}%` : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#7C3AED' }}>{clickRate !== '—' ? `${clickRate}%` : '—'}</td>
                      <td style={{ padding:'10px 14px' }}>{statusBadge(c.status)}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:T.text3 }}>{c.date}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          {c.status === 'draft' && <button style={{ padding:'4px 8px', border:`1px solid #86EFAC`, background:'#DCFCE7', color:'#166534', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600 }}>▶ Envoyer</button>}
                          <button style={{ padding:'4px 8px', border:`1px solid ${T.border}`, background:T.surface2, color:T.text2, borderRadius:8, fontSize:11, cursor:'pointer' }}>✏️</button>
                          <button style={{ padding:'4px 8px', border:`1px solid ${T.border}`, background:T.surface2, color:T.text2, borderRadius:8, fontSize:11, cursor:'pointer' }}>📊</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Emails transactionnels */}
      {view === 'transactional' && (
        <div>
          <div style={{ background:'#FEF3C7', border:`1px solid #FCD34D`, borderRadius:14, padding:'14px 18px', marginBottom:18, display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ fontSize:22 }}>⚡</div>
            <div style={{ flex:1, fontSize:13, color:'#78350F', lineHeight:1.5 }}>
              <strong>Emails transactionnels.</strong> Templates déclenchés automatiquement par les actions des utilisateur·rices (inscription, signature, transaction T99CP, etc.). Modifiez le contenu, l'objet et l'expéditeur. Variables disponibles :{' '}
              <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 6px', borderRadius:4, fontSize:11 }}>{'{{first_name}}'}</code>{' '}
              <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 6px', borderRadius:4, fontSize:11 }}>{'{{petition_title}}'}</code>{' '}
              <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 6px', borderRadius:4, fontSize:11 }}>{'{{amount_t99cp}}'}</code>{' '}…
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${T.border}`, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:T.surface2 }}>
                {['Template ID','Nom','Déclencheur','Modifié','Envois 7j','Ouverture','Statut','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {transactional.map(t=>(
                  <tr key={t.id} style={{ borderTop:`1px solid ${T.border}` }} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 14px' }}><code style={{ fontSize:11, fontFamily:'monospace', background:T.surface2, padding:'3px 6px', borderRadius:4, color:T.text2 }}>{t.id}</code></td>
                    <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:T.text1 }}>{t.name}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:T.text3 }}>{t.trigger}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:T.text3 }}>{t.lastEdit}</td>
                    <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:T.text1 }}>{t.sent7d.toLocaleString('fr-FR')}</td>
                    <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#16A34A' }}>{t.opened}</td>
                    <td style={{ padding:'10px 14px' }}>{statusBadge(t.status)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button style={{ padding:'4px 8px', border:`1px solid #FCD34D`, background:'#FEF9C3', color:'#92400E', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600 }}>✏️ Éditer</button>
                        <button style={{ padding:'4px 8px', border:`1px solid ${T.border}`, background:T.surface2, color:T.text2, borderRadius:8, fontSize:11, cursor:'pointer' }}>👁️ Aperçu</button>
                        <button style={{ padding:'4px 8px', border:`1px solid ${T.border}`, background:T.surface2, color:T.text2, borderRadius:8, fontSize:11, cursor:'pointer' }}>📤 Test</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segments */}
      {view === 'segments' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:10, flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:T.text1, margin:0 }}>Segments d'audience</h2>
            <Btn variant="gradient" size="sm">+ Nouveau segment</Btn>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {segments.map(s=>(
              <Card key={s.name} style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text1, margin:0 }}>{s.name}</h3>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:T.brand }}>{s.count.toLocaleString('fr-FR')}</span>
                </div>
                <div style={{ fontSize:12, color:T.text3, marginBottom:14, lineHeight:1.5 }}>{s.desc}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <Btn variant="outline" size="sm" style={{ flex:1 }}>Voir</Btn>
                  <Btn variant="ghost" size="sm" style={{ flex:1 }}>📤 Cibler</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Domaine & DNS */}
      {view === 'domain' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card style={{ padding:'20px 24px' }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:T.text1, margin:'0 0 14px' }}>Configuration DNS — maintenant.org</h3>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:T.surface2 }}>
                {['Type','Nom','Valeur','Statut'].map(h=><th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  ['MX',  '@',                       '10 feedback-smtp.eu-west-1.amazonses.com',                   true],
                  ['TXT', '@',                       'v=spf1 include:amazonses.com ~all',                         true],
                  ['TXT', 'resend._domainkey',       'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNAD…(DKIM)',                    true],
                  ['TXT', '_dmarc',                  'v=DMARC1; p=none; rua=mailto:dmarc@maintenant.org',         true],
                  ['CNAME','em.maintenant.org',     'em.resend.com',                                              true],
                ].map((r,i)=>(
                  <tr key={i} style={{ borderTop:`1px solid ${T.border}` }}>
                    <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:T.brand }}>{r[0]}</td>
                    <td style={{ padding:'10px 14px', fontFamily:'monospace', color:T.text2 }}>{r[1]}</td>
                    <td style={{ padding:'10px 14px', fontFamily:'monospace', color:T.text3, fontSize:11, maxWidth:380, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r[2]}</td>
                    <td style={{ padding:'10px 14px' }}>{r[3] ? <Badge color="green" style={{ fontSize:10 }}>✓ Vérifié</Badge> : <Badge color="amber" style={{ fontSize:10 }}>⏳ En attente</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card style={{ padding:'20px 24px' }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:T.text1, margin:'0 0 12px' }}>Adresses d'expéditeur</h3>
            {[
              { addr:'newsletter@maintenant.org',    label:'Newsletter hebdomadaire',   default:true },
              { addr:'noreply@maintenant.org',         label:'Emails transactionnels',     default:false },
              { addr:'redaction@maintenant.org',       label:'Communications éditoriales', default:false },
              { addr:'support@maintenant.org',         label:'Support membres',            default:false },
            ].map((a,i,arr)=>(
              <div key={a.addr} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom:i<arr.length-1?`1px solid ${T.border}`:'none' }}>
                <code style={{ fontSize:12, fontFamily:'monospace', color:T.text1, fontWeight:600 }}>{a.addr}</code>
                <span style={{ fontSize:12, color:T.text3, flex:1 }}>{a.label}</span>
                {a.default && <Badge color="brand" style={{ fontSize:10 }}>Par défaut</Badge>}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Compose campaign modal (allégé) ───────────────────────
function ComposeCampaign({ onClose, segments }) {
  const T = window.T;
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState({ name:'', subject:'', from:'newsletter@maintenant.org', segment:'', body:'' });

  return (
    <div style={{ background:'#fff', borderRadius:16, border:`2px dashed ${T.brand}`, padding:'22px 26px', marginBottom:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:T.text1, margin:0 }}>📨 Nouvelle campagne</h3>
        <button onClick={onClose} style={{ border:'none', background:T.surface2, borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:16, color:T.text3 }}>×</button>
      </div>

      {/* Steps indicator */}
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {['1. Contenu', '2. Audience', '3. Aperçu & envoi'].map((l,i)=>(
          <div key={i} style={{ flex:1, padding:'8px 12px', borderRadius:8, background:step===i+1?T.brandLight:T.surface2, color:step===i+1?T.brand:T.text3, fontSize:12, fontWeight:700, textAlign:'center', border:step===i+1?`1px solid ${T.brand}`:`1px solid transparent` }}>{l}</div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><label style={{ fontSize:12, fontWeight:700, color:T.text2, display:'block', marginBottom:4 }}>Nom interne de la campagne</label>
            <input value={data.name} onChange={e=>setData({...data, name:e.target.value})} placeholder="ex: Newsletter Sem. 18" style={{ width:'100%', height:40, border:`1.5px solid ${T.border}`, borderRadius:10, padding:'0 14px', fontSize:13, fontFamily:'Inter,sans-serif', boxSizing:'border-box' }} /></div>
          <div><label style={{ fontSize:12, fontWeight:700, color:T.text2, display:'block', marginBottom:4 }}>Objet de l'email</label>
            <input value={data.subject} onChange={e=>setData({...data, subject:e.target.value})} placeholder="ex: ✊ La voix des 99% — Cette semaine" style={{ width:'100%', height:40, border:`1.5px solid ${T.border}`, borderRadius:10, padding:'0 14px', fontSize:13, fontFamily:'Inter,sans-serif', boxSizing:'border-box' }} />
            <div style={{ fontSize:11, color:T.text4, marginTop:4 }}>{data.subject.length}/80 caractères · les emojis ↑ taux d'ouverture de ~14%</div></div>
          <div><label style={{ fontSize:12, fontWeight:700, color:T.text2, display:'block', marginBottom:4 }}>Expéditeur</label>
            <select value={data.from} onChange={e=>setData({...data, from:e.target.value})} style={{ width:'100%', height:40, border:`1.5px solid ${T.border}`, borderRadius:10, padding:'0 14px', fontSize:13, fontFamily:'Inter,sans-serif', background:'#fff', boxSizing:'border-box' }}>
              <option>newsletter@maintenant.org</option>
              <option>redaction@maintenant.org</option>
              <option>support@maintenant.org</option>
            </select></div>
          <div><label style={{ fontSize:12, fontWeight:700, color:T.text2, display:'block', marginBottom:4 }}>Contenu (Markdown ou HTML)</label>
            <textarea value={data.body} onChange={e=>setData({...data, body:e.target.value})} placeholder="# Cette semaine en mobilisation&#10;&#10;Bonjour {{first_name}},&#10;..." rows={8} style={{ width:'100%', border:`1.5px solid ${T.border}`, borderRadius:10, padding:'12px 14px', fontSize:13, fontFamily:'monospace', resize:'vertical', boxSizing:'border-box' }} /></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <Btn variant="ghost" size="sm" onClick={onClose}>Annuler</Btn>
            <Btn variant="gradient" size="sm" onClick={()=>setStep(2)}>Suivant : audience →</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:T.text2, display:'block', marginBottom:8 }}>Choisissez un segment</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8, marginBottom:18 }}>
            {segments.map(s=>(
              <button key={s.name} onClick={()=>setData({...data, segment:s.name})}
                style={{ textAlign:'left', padding:'12px 14px', borderRadius:10, border:`2px solid ${data.segment===s.name?T.brand:T.border}`, background:data.segment===s.name?T.brandLight:T.surface, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.text1, marginBottom:2 }}>{s.name}</div>
                <div style={{ fontSize:11, color:T.text3 }}>{s.count.toLocaleString('fr-FR')} destinataires</div>
              </button>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
            <Btn variant="ghost" size="sm" onClick={()=>setStep(1)}>← Retour</Btn>
            <Btn variant="gradient" size="sm" onClick={()=>setStep(3)} disabled={!data.segment}>Suivant : aperçu →</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ background:T.surface2, borderRadius:12, padding:'18px 20px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.text4, textTransform:'uppercase', marginBottom:8 }}>Récapitulatif</div>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'8px 16px', fontSize:13 }}>
              <span style={{ color:T.text3 }}>Campagne</span><span style={{ fontWeight:600, color:T.text1 }}>{data.name || '(sans nom)'}</span>
              <span style={{ color:T.text3 }}>Objet</span><span style={{ fontWeight:600, color:T.text1 }}>{data.subject || '(vide)'}</span>
              <span style={{ color:T.text3 }}>Expéditeur</span><span style={{ fontWeight:600, color:T.text1 }}>{data.from}</span>
              <span style={{ color:T.text3 }}>Audience</span><span style={{ fontWeight:600, color:T.brand }}>{data.segment} · {segments.find(s=>s.name===data.segment)?.count.toLocaleString('fr-FR')} destinataires</span>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
            <Btn variant="ghost" size="sm" onClick={()=>setStep(2)}>← Retour</Btn>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="outline" size="sm">📤 Envoyer test (à moi)</Btn>
              <Btn variant="success" size="sm" onClick={()=>{ alert(`Campagne "${data.name}" programmée\n→ Envoi via Resend dans 5 min\n→ ${segments.find(s=>s.name===data.segment)?.count.toLocaleString('fr-FR')} destinataires`); onClose(); }}>▶ Envoyer maintenant</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PANEL API & CONNEXIONS (vers the99coinproject.org)
// ════════════════════════════════════════════════════════════
function ApiConnectionsPanel() {
  const T = window.T;
  const [activeKey, setActiveKey] = React.useState(null);
  const [keyVisible, setKeyVisible] = React.useState({});

  const apiKeys = [
    { id:'pk_live_1', name:'the99coinproject.org · Production', key:'mn_live_a47b8c2f9d1e4a6b8c0d2e4f6a8b0c2d', created:'2026-02-15', last_used:'2026-04-25 14:32', requests_30d: 184302, scopes:['read:auth','read:users','write:t99cp','read:petitions'] },
    { id:'pk_test_1', name:'the99coinproject.org · Sandbox',     key:'mn_test_b58c9d3a0e2f5b7c9d1e3f5a7b9c1d3e',  created:'2026-01-10', last_used:'2026-04-25 09:17', requests_30d: 8421,   scopes:['read:auth','read:users'] },
    { id:'pk_mob_1',  name:'App mobile iOS/Android',              key:'mn_live_c69d0e4b1f3a6c8d0e2f4a6b8c0d2e4f',  created:'2026-03-22', last_used:'2026-04-25 14:31', requests_30d: 92140,  scopes:['read:auth','read:users','read:petitions','write:signatures'] },
  ];

  const endpoints = [
    { method:'POST', path:'/api/v1/auth/sso',           desc:'Single Sign-On — connexion croisée',                  scope:'read:auth',         requests_30d:42103, status:'stable' },
    { method:'GET',  path:'/api/v1/users/me',           desc:'Profil de l\'utilisateur authentifié',                scope:'read:users',        requests_30d:88412, status:'stable' },
    { method:'GET',  path:'/api/v1/users/{id}/wallet',  desc:'Wallet T99CP : solde + adresse Polygon',              scope:'read:t99cp',        requests_30d:12340, status:'stable' },
    { method:'POST', path:'/api/v1/t99cp/transfer',     desc:'Initier un transfert T99CP entre wallets',            scope:'write:t99cp',       requests_30d:823,   status:'stable' },
    { method:'GET',  path:'/api/v1/petitions',          desc:'Liste paginée des pétitions actives',                  scope:'read:petitions',    requests_30d:5210,  status:'stable' },
    { method:'GET',  path:'/api/v1/petitions/{slug}',   desc:'Détail d\'une pétition + statistiques',                scope:'read:petitions',    requests_30d:14502, status:'stable' },
    { method:'POST', path:'/api/v1/petitions/{slug}/sign', desc:'Signer une pétition au nom d\'un utilisateur',        scope:'write:signatures',  requests_30d:1340,  status:'stable' },
    { method:'GET',  path:'/api/v1/polls',              desc:'Liste des sondages publics',                            scope:'read:polls',        requests_30d:2104,  status:'beta'   },
    { method:'POST', path:'/api/v1/polls/{id}/vote',     desc:'Enregistrer un vote (compte requis)',                  scope:'write:votes',       requests_30d:412,   status:'beta'   },
    { method:'POST', path:'/webhooks/inscriptions',     desc:'Webhook : notifier the99coinproject.org d\'une nouvelle inscription', scope:'webhook', requests_30d:184, status:'stable' },
    { method:'POST', path:'/webhooks/transactions',     desc:'Webhook : transactions T99CP onchain',                  scope:'webhook',           requests_30d:946,   status:'stable' },
  ];

  const methodColor = (m) => ({ GET:'#16A34A', POST:'#7C3AED', PUT:'#F59E0B', DELETE:'#DC2626', PATCH:'#0891B2' }[m] || T.text3);

  return (
    <div>
      {/* Cross-link banner */}
      <div style={{ background:'linear-gradient(135deg,#7C3AED 0%,#E11D74 100%)', borderRadius:14, padding:'16px 22px', marginBottom:20, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🔗</div>
          <div style={{ flex:1, minWidth:240 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, marginBottom:2 }}>API publique Maintenant! ↔ The99CoinProject</div>
            <div style={{ fontSize:13, opacity:0.9 }}>SSO, partage des wallets T99CP, des signatures, des votes. Authentification OAuth 2.0 + clés API.</div>
          </div>
          <Btn variant="white" size="sm" onClick={()=>window.open('https://the99coinproject.org','_blank')}>↗ the99coinproject.org</Btn>
        </div>
      </div>

      {/* === Clés API === */}
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:T.text1, margin:'0 0 12px', display:'flex', alignItems:'center', gap:10 }}>
        🔑 Clés API <span style={{ fontSize:11, fontWeight:600, color:T.text4, padding:'2px 8px', background:T.surface2, borderRadius:9999 }}>{apiKeys.length} actives</span>
      </h2>
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${T.border}`, overflow:'hidden', marginBottom:24 }}>
        {apiKeys.map((k,i)=>(
          <div key={k.id} style={{ padding:'16px 20px', borderTop:i>0?`1px solid ${T.border}`:'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:10, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text1, marginBottom:3 }}>{k.name}</div>
                <div style={{ fontSize:11, color:T.text3 }}>Créée le {k.created} · Dernière utilisation : {k.last_used}</div>
              </div>
              <Badge color={k.id.startsWith('pk_test')?'amber':'green'} style={{ fontSize:10 }}>
                {k.id.startsWith('pk_test') ? '🧪 SANDBOX' : '✓ PRODUCTION'}
              </Badge>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:T.surface2, borderRadius:8, fontFamily:'monospace', fontSize:12, marginBottom:10 }}>
              <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', color:T.text2 }}>
                {keyVisible[k.id] ? k.key : k.key.substring(0,12) + '••••••••••••••••••••••••'}
              </span>
              <button onClick={()=>setKeyVisible({...keyVisible, [k.id]:!keyVisible[k.id]})} style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:T.text3 }}>{keyVisible[k.id] ? '🙈' : '👁️'}</button>
              <button onClick={()=>{ navigator.clipboard?.writeText(k.key); }} style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:T.text3 }}>📋</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
              <span style={{ fontSize:11, color:T.text3, fontWeight:600 }}>Scopes :</span>
              {k.scopes.map(s=>(
                <code key={s} style={{ fontSize:10, fontFamily:'monospace', background:T.brandLight, color:T.brand, padding:'2px 8px', borderRadius:9999, fontWeight:600 }}>{s}</code>
              ))}
              <span style={{ marginLeft:'auto', fontSize:11, color:T.text3 }}>{k.requests_30d.toLocaleString('fr-FR')} req · 30j</span>
              <button style={{ marginLeft:8, padding:'4px 10px', border:`1px solid #FCA5A5`, background:'#FEE2E2', color:'#991B1B', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600 }}>🔄 Régénérer</button>
            </div>
          </div>
        ))}
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${T.border}`, background:T.surface2 }}>
          <Btn variant="gradient" size="sm">+ Créer une nouvelle clé API</Btn>
        </div>
      </div>

      {/* === Endpoints === */}
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:T.text1, margin:'0 0 6px', display:'flex', alignItems:'center', gap:10 }}>
        📡 Endpoints disponibles
      </h2>
      <p style={{ fontSize:13, color:T.text3, margin:'0 0 14px' }}>
        Base URL : <code style={{ fontFamily:'monospace', background:T.surface2, padding:'2px 8px', borderRadius:4, color:T.brand, fontWeight:700 }}>https://api.maintenant.org</code>{' '}·{' '}
        Authentification : header <code style={{ fontFamily:'monospace', background:T.surface2, padding:'2px 8px', borderRadius:4, color:T.text2 }}>Authorization: Bearer mn_live_…</code>
      </p>
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${T.border}`, overflow:'hidden', marginBottom:24 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:T.surface2 }}>
            {['Méthode','Endpoint','Description','Scope requis','Req · 30j','Statut'].map(h=>(
              <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {endpoints.map((e,i)=>(
              <tr key={i} style={{ borderTop:`1px solid ${T.border}` }} onMouseEnter={ev=>ev.currentTarget.style.background=T.surface2} onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                <td style={{ padding:'9px 14px' }}>
                  <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:800, color:'#fff', background:methodColor(e.method), padding:'3px 8px', borderRadius:4 }}>{e.method}</span>
                </td>
                <td style={{ padding:'9px 14px' }}><code style={{ fontFamily:'monospace', fontSize:12, color:T.text1, fontWeight:600 }}>{e.path}</code></td>
                <td style={{ padding:'9px 14px', fontSize:12, color:T.text2 }}>{e.desc}</td>
                <td style={{ padding:'9px 14px' }}><code style={{ fontSize:10, fontFamily:'monospace', background:T.brandLight, color:T.brand, padding:'2px 7px', borderRadius:9999, fontWeight:600 }}>{e.scope}</code></td>
                <td style={{ padding:'9px 14px', fontSize:12, fontWeight:600, color:T.text2 }}>{e.requests_30d.toLocaleString('fr-FR')}</td>
                <td style={{ padding:'9px 14px' }}><Badge color={e.status==='stable'?'green':'amber'} style={{ fontSize:10 }}>{e.status === 'stable' ? '✓ Stable' : '🧪 Beta'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Exemple SSO === */}
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:T.text1, margin:'0 0 12px' }}>🚀 Exemple — Connexion SSO depuis the99coinproject.org</h2>
      <Card style={{ padding:0, overflow:'hidden', marginBottom:24 }}>
        <div style={{ background:'#0F172A', padding:'20px 24px', fontFamily:'monospace', fontSize:12, color:'#E2E8F0', overflow:'auto' }}>
          <div style={{ color:'#64748B', marginBottom:8 }}>// 1. Rediriger l'utilisateur vers Maintenant! pour authentification</div>
          <div><span style={{ color:'#7DD3FC' }}>const</span> <span style={{ color:'#FBBF24' }}>authUrl</span> = <span style={{ color:'#86EFAC' }}>{'`https://api.maintenant.org/oauth/authorize'}</span></div>
          <div style={{ paddingLeft:32, color:'#86EFAC' }}>{'?client_id=the99coinproject'}</div>
          <div style={{ paddingLeft:32, color:'#86EFAC' }}>{'&redirect_uri=https://the99coinproject.org/auth/callback'}</div>
          <div style={{ paddingLeft:32, color:'#86EFAC' }}>{'&scope=read:auth+read:users+read:t99cp'}</div>
          <div style={{ paddingLeft:32, color:'#86EFAC' }}>{'&response_type=code`'}</div>
          <br/>
          <div style={{ color:'#64748B', marginBottom:8 }}>// 2. Échanger le code contre un access_token</div>
          <div><span style={{ color:'#7DD3FC' }}>const</span> <span style={{ color:'#FBBF24' }}>res</span> = <span style={{ color:'#7DD3FC' }}>await</span> <span style={{ color:'#F472B6' }}>fetch</span>(<span style={{ color:'#86EFAC' }}>'https://api.maintenant.org/oauth/token'</span>, {'{'}</div>
          <div style={{ paddingLeft:16 }}>method: <span style={{ color:'#86EFAC' }}>'POST'</span>,</div>
          <div style={{ paddingLeft:16 }}>headers: {'{'} <span style={{ color:'#86EFAC' }}>'Content-Type'</span>: <span style={{ color:'#86EFAC' }}>'application/json'</span> {'}'},</div>
          <div style={{ paddingLeft:16 }}>body: <span style={{ color:'#F472B6' }}>JSON.stringify</span>({'{'} client_id, client_secret, code, grant_type: <span style={{ color:'#86EFAC' }}>'authorization_code'</span> {'}'})</div>
          <div>{'});'}</div>
          <br/>
          <div style={{ color:'#64748B', marginBottom:8 }}>// 3. Récupérer le profil utilisateur + wallet T99CP</div>
          <div><span style={{ color:'#7DD3FC' }}>const</span> <span style={{ color:'#FBBF24' }}>{'{ access_token }'}</span> = <span style={{ color:'#7DD3FC' }}>await</span> res.<span style={{ color:'#F472B6' }}>json</span>();</div>
          <div><span style={{ color:'#7DD3FC' }}>const</span> <span style={{ color:'#FBBF24' }}>user</span> = <span style={{ color:'#7DD3FC' }}>await</span> <span style={{ color:'#F472B6' }}>fetch</span>(<span style={{ color:'#86EFAC' }}>'https://api.maintenant.org/api/v1/users/me'</span>, {'{'}</div>
          <div style={{ paddingLeft:16 }}>headers: {'{'} <span style={{ color:'#86EFAC' }}>'Authorization'</span>: <span style={{ color:'#86EFAC' }}>{'`Bearer ${access_token}`'}</span> {'}'}</div>
          <div>{'}).then(r => r.json());'}</div>
          <br/>
          <div style={{ color:'#64748B' }}>{'// → { id, name, email, t99cp_balance, wallet_address, badges, joined }'}</div>
        </div>
      </Card>

      {/* === Webhooks & rate limits === */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14 }}>
        <Card style={{ padding:'18px 22px' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:T.text1, margin:'0 0 10px' }}>⚡ Rate limits</h3>
          <table style={{ width:'100%', fontSize:13 }}>
            <tbody>
              <tr><td style={{ color:T.text3, padding:'4px 0' }}>Production</td><td style={{ fontWeight:700, color:T.text1, textAlign:'right' }}>1 000 req/min</td></tr>
              <tr><td style={{ color:T.text3, padding:'4px 0' }}>Sandbox</td><td style={{ fontWeight:700, color:T.text1, textAlign:'right' }}>100 req/min</td></tr>
              <tr><td style={{ color:T.text3, padding:'4px 0' }}>Burst</td><td style={{ fontWeight:700, color:T.text1, textAlign:'right' }}>5 000 req</td></tr>
              <tr><td style={{ color:T.text3, padding:'4px 0' }}>Header retour</td><td style={{ fontFamily:'monospace', fontSize:11, color:T.text2, textAlign:'right' }}>X-RateLimit-*</td></tr>
            </tbody>
          </table>
        </Card>
        <Card style={{ padding:'18px 22px' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:T.text1, margin:'0 0 10px' }}>📨 Webhooks sortants</h3>
          <p style={{ fontSize:12, color:T.text3, margin:'0 0 10px', lineHeight:1.5 }}>Les évènements sont signés HMAC-SHA256 (header <code style={{ fontSize:10, background:T.surface2, padding:'1px 4px', borderRadius:3 }}>X-Mn-Signature</code>) et envoyés à the99coinproject.org pour synchronisation.</p>
          {['user.created','user.kyc_verified','t99cp.transfer','petition.signed','poll.voted'].map(ev=>(
            <code key={ev} style={{ display:'inline-block', fontSize:10, fontFamily:'monospace', background:T.surface2, color:T.text2, padding:'2px 7px', borderRadius:9999, fontWeight:600, marginRight:5, marginBottom:5 }}>{ev}</code>
          ))}
        </Card>
        <Card style={{ padding:'18px 22px' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:T.text1, margin:'0 0 10px' }}>📚 Ressources</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
            <a href="#" style={{ color:T.brand, textDecoration:'none', fontWeight:600 }}>→ Documentation complète</a>
            <a href="#" style={{ color:T.brand, textDecoration:'none', fontWeight:600 }}>→ Référence OpenAPI 3.0</a>
            <a href="#" style={{ color:T.brand, textDecoration:'none', fontWeight:600 }}>→ Postman collection</a>
            <a href="#" style={{ color:T.brand, textDecoration:'none', fontWeight:600 }}>→ Status page api.maintenant.org</a>
            <a href="#" style={{ color:T.brand, textDecoration:'none', fontWeight:600 }}>→ Changelog API</a>
          </div>
        </Card>
      </div>
    </div>
  );
}

window.EmailingsPanel = EmailingsPanel;
window.ApiConnectionsPanel = ApiConnectionsPanel;
