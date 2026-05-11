// JoinMovement.jsx — Adhésion au mouvement Maintenant!
// 3 formules : Gratuit · 12 T99CP · 12€ Stripe
const { useState } = React;

const PLANS = [
  { id: 'free',   label: 'Adhésion de soutien',  price: 0,   currency: null,   desc: 'Adhérez gratuitement et rejoignez le mouvement. Accès complet à l\'espace adhérent.', highlight: false },
  { id: 't99cp',  label: 'Cotisation solidaire',  price: 12,  currency: 'T99CP', desc: '12 T99CP / an · Financement solidaire de la plateforme via votre wallet Polygon.', highlight: true },
  { id: 'stripe', label: 'Cotisation classique',  price: 12,  currency: '€',    desc: '12 € / an · Paiement sécurisé par carte via Stripe.', highlight: false },
];

function JoinMovementPage({ user, onAuth, onJoin, setPage }) {
  const [step, setStep] = useState(1); // 1: plan, 2: form, 3: payment, 4: success
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState({ email: user?.email || '', nom: user?.name || '', code_postal: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email invalide';
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.code_postal.match(/^\d{5}$/)) e.code_postal = 'Code postal invalide (5 chiffres)';
    if (!agreed) e.agreed = 'Veuillez accepter les statuts';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      onJoin && onJoin({ ...form, plan: plan.id, adhesion_date: new Date().toISOString() });
    }, 1000);
  };

  const inputStyle = {
    width: '100%', height: 50, border: `1.5px solid ${T.border}`, borderRadius: 14,
    padding: '0 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1,
    background: T.surface, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  if (step === 4) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: T.successLight, border: `2px solid ${T.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: T.success }}>
          {ICONS.check}
        </div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 30, fontWeight: 800, color: T.text1, margin: '0 0 12px', letterSpacing: '-0.03em' }}>Bienvenue dans le mouvement !</h1>
        <p style={{ fontSize: 16, color: T.text3, lineHeight: 1.65, margin: '0 0 32px' }}>
          Votre adhésion est confirmée. Vous avez désormais accès à l'espace adhérent, aux Communes Libres et à l'Assemblée Confédérale.
        </p>
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '24px', marginBottom: 28, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Récapitulatif</div>
          {[['Adhérent·e', form.nom], ['Email', form.email], ['Code postal', form.code_postal], ['Cotisation', plan?.label], ['Date', new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
              <span style={{ color: T.text3 }}>{l}</span>
              <span style={{ fontWeight: 600, color: T.text1 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Btn variant="gradient" size="lg" onClick={() => setPage('membres')}>Accéder à l'espace adhérent</Btn>
          <Btn variant="surface" size="lg" onClick={() => setPage('home')}>Retour à l'accueil</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: T.text1, padding: 'clamp(48px,8vw,96px) 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1600&q=60" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} onError={e => e.target.style.display = 'none'} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(26,26,24,0.97),rgba(225,29,116,0.85))' }}></div>
        </div>
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <Tag variant="gradient" style={{ marginBottom: 20, display: 'inline-flex' }}>Mouvement Maintenant !</Tag>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,5vw,56px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Adhérez au mouvement
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0 }}>
            L'adhésion vous donne accès à l'espace adhérent, aux Communes Libres, aux Fédérations et à l'Assemblée Confédérale des Communes et Territoires Libres.
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 0 }}>
          {[['1', 'Formule'], ['2', 'Informations'], ['3', 'Paiement']].map(([n, label], i) => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i + 1 ? T.success : step === i + 1 ? T.brand : T.surface2, color: step >= i + 1 ? '#fff' : T.text4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.3s' }}>
                  {step > i + 1 ? ICONS.check : n}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? T.text1 : T.text4 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? T.success : T.border, margin: '0 12px' }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* Step 1 — Formule */}
        {step === 1 && (
          <div>
            <SectionTitle label="Étape 1" title="Choisissez votre formule" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p)}
                  style={{ background: T.surface, borderRadius: 18, border: `2px solid ${plan?.id === p.id ? T.brand : p.highlight ? `${T.brand}40` : T.border}`, padding: '22px 24px', cursor: 'pointer', transition: 'all 0.18s', position: 'relative', boxShadow: plan?.id === p.id ? `0 8px 28px rgba(225,29,116,0.12)` : 'none' }}
                  onMouseEnter={e => { if (plan?.id !== p.id) e.currentTarget.style.borderColor = `${T.brand}60`; }}
                  onMouseLeave={e => { if (plan?.id !== p.id) e.currentTarget.style.borderColor = p.highlight ? `${T.brand}40` : T.border; }}>
                  {p.highlight && <Tag variant="gradient" size="xs" style={{ position: 'absolute', top: -10, left: 20 }}>Recommandé</Tag>}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${plan?.id === p.id ? T.brand : T.border}`, background: plan?.id === p.id ? T.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.15s' }}>
                      {plan?.id === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }}></div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: T.text1 }}>{p.label}</span>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: p.price === 0 ? T.success : T.brand }}>
                          {p.price === 0 ? 'Gratuit' : `${p.price} ${p.currency}`}
                        </span>
                        {p.price > 0 && <span style={{ fontSize: 12, color: T.text4 }}>/an</span>}
                      </div>
                      <p style={{ fontSize: 14, color: T.text3, margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Btn full variant="gradient" size="lg" style={{ marginTop: 28 }} disabled={!plan} onClick={() => { if (!user) { onAuth(); return; } setStep(2); }}>
              Continuer avec cette formule {ICONS.arrow_r}
            </Btn>
          </div>
        )}

        {/* Step 2 — Formulaire */}
        {step === 2 && (
          <div>
            <SectionTitle label="Étape 2" title="Vos informations" />
            <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'nom', label: 'Nom complet *', type: 'text', placeholder: 'Marie Dupont' },
                { key: 'email', label: 'Adresse email *', type: 'email', placeholder: 'marie@exemple.fr' },
                { key: 'code_postal', label: 'Code postal *', type: 'text', placeholder: '75010', maxLength: 5 },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.text3, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <input
                    type={f.type} value={form[f.key]} maxLength={f.maxLength}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ ...inputStyle, borderColor: errors[f.key] ? '#EF4444' : T.border }}
                    onFocus={e => e.target.style.borderColor = T.brand}
                    onBlur={e => e.target.style.borderColor = errors[f.key] ? '#EF4444' : T.border}
                  />
                  {errors[f.key] && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors[f.key]}</div>}
                </div>
              ))}

              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setAgreed(!agreed)} style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${agreed ? T.brand : errors.agreed ? '#EF4444' : T.border}`, background: agreed ? T.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {agreed && <div style={{ color: '#fff', display: 'flex', transform: 'scale(0.8)' }}>{ICONS.check}</div>}
                </div>
                <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                  J'adhère aux statuts de Maintenant! et au projet de THE99COINPROJECT. Je m'engage à respecter la charte du mouvement. {errors.agreed && <span style={{ color: '#EF4444' }}>*</span>}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Btn variant="surface" size="lg" onClick={() => setStep(1)} icon={ICONS.arrow_l}>Retour</Btn>
              <Btn variant="gradient" size="lg" style={{ flex: 1 }} onClick={() => { if (validate()) setStep(3); }}>
                Continuer vers le paiement {ICONS.arrow_r}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 3 — Paiement */}
        {step === 3 && (
          <div>
            <SectionTitle label="Étape 3" title="Paiement & confirmation" />
            <div style={{ background: T.surface2, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Récapitulatif</div>
              {[['Adhérent·e', form.nom], ['Email', form.email], ['Code postal', form.code_postal], ['Formule', plan?.label]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                  <span style={{ color: T.text3 }}>{l}</span><span style={{ fontWeight: 600, color: T.text1 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 16, fontWeight: 700 }}>
                <span style={{ color: T.text1 }}>Total annuel</span>
                <span style={{ color: plan?.price === 0 ? T.success : T.brand }}>
                  {plan?.price === 0 ? 'Gratuit' : `${plan?.price} ${plan?.currency}`}
                </span>
              </div>
            </div>

            {plan?.id === 'free' && (
              <div style={{ background: T.successLight, borderRadius: 16, border: `1px solid #BBF7D0`, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.success, marginBottom: 6 }}>Adhésion gratuite</div>
                <p style={{ fontSize: 14, color: T.success, margin: 0, opacity: 0.9 }}>Aucun paiement requis. Confirmez votre adhésion en cliquant ci-dessous.</p>
              </div>
            )}

            {plan?.id === 't99cp' && (
              <div style={{ background: T.infoLight, borderRadius: 16, border: '1px solid #BFDBFE', padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.info, marginBottom: 6 }}>Paiement en T99CP</div>
                <p style={{ fontSize: 14, color: T.info, margin: '0 0 14px', opacity: 0.9 }}>12 T99CP seront débités de votre wallet sur le réseau Polygon. Vous serez redirigé vers the99coinproject.org pour confirmer.</p>
                <Btn variant="blue" size="md" icon={ICONS.wallet} onClick={() => window.open('https://the99coinproject.org', '_blank')}>Ouvrir mon wallet T99CP</Btn>
              </div>
            )}

            {plan?.id === 'stripe' && (
              <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text1, marginBottom: 14 }}>Paiement par carte</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
                  <input placeholder="Numéro de carte" style={{ ...inputStyle, height: 46 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="MM/AA" style={{ ...inputStyle, height: 46, width: 90 }} />
                    <input placeholder="CVV" style={{ ...inputStyle, height: 46, width: 70 }} />
                  </div>
                </div>
                <input placeholder="Nom sur la carte" style={{ ...inputStyle, height: 46, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: T.text4, marginTop: 8 }}>
                  {ICONS.check}<span>Paiement sécurisé SSL — Propulsé par Stripe</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <Btn variant="surface" size="lg" onClick={() => setStep(2)} icon={ICONS.arrow_l}>Retour</Btn>
              <Btn variant="gradient" size="lg" style={{ flex: 1 }} disabled={loading} onClick={handlePay}>
                {loading ? 'Traitement...' : plan?.price === 0 ? 'Confirmer mon adhésion' : `Payer ${plan?.price} ${plan?.currency} et adhérer`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.JoinMovementPage = JoinMovementPage;
