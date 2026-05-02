import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// --- 1. DATOS PREDETERMINADOS PARA EL USUARIO DEMO ---
const DEMO_USER_DATA = {
    name: "Juan David Beltrán",
    idNumber: "123****19",
    phone: "310****95",
    cards: ["45658******8765", "69241******3241"],
    addresses: [
      { id: 1, text: "Carrera 43B # 4F - 72", active: true },
      { id: 2, text: "Calle 81# 11 - 08 piso 11", active: false }
    ]
};

const DEMO_CART = [
    { id: 1, name: "Iphone 15 pro max", price: 4749990, qty: 1, discount: "-23%", shipping: "Gratis", img: "/img_iphone.jpg", selected: false },
    { id: 2, name: "6 pack CocaCola", price: 11490, qty: 1, discount: "-5%", shipping: "$2.300 COP", img: "/img_coca.jpg", selected: false }
];

const DEMO_ENVIOS = [
    { id: 1, name: "Nevera Haceb No Frost", price: "$2.599.590", img: "/img_nevera.jpg", date: "21 de Noviembre", discount: "-30%" },
    { id: 2, name: "Colchón Pullman Semi-Doble", price: "$1.699.990", img: "/img_colchon.jpg", date: "18 de Noviembre", discount: "-10%" }
];

function App() {
  // --- 2. ESTADOS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [view, setView] = useState('home');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');       
  const [idNumber, setIdNumber] = useState(''); 
  const [phone, setPhone] = useState('');      

  // Estados de datos (Inician vacíos para usuarios nuevos)
  const [userProfile, setUserProfile] = useState({ name: "", idNumber: "", phone: "", cards: [], addresses: [] });
  const [cart, setCart] = useState([]);
  const [shipments, setShipments] = useState([]); 

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false); 
  const [editMode, setEditMode] = useState(null);

  // --- 3. LÓGICA DE LOGIN Y REGISTRO ---
const handleLogin = async () => {
  // 1. Validación para el usuario DEMO (Local)
  if (email === "email@example.com" && password === "1234") {
    setUserProfile(DEMO_USER_DATA);
    setCart(DEMO_CART);
    setShipments(DEMO_ENVIOS);
    setView('home');
    setIsLoggedIn(true);
    return; // Detenemos la ejecución aquí si es el demo
  }

  // 2. Validación para usuarios registrados (Backend)
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Si el servidor confirma que el usuario existe y la clave es correcta
      setUserProfile({
        name: data.user.name,
        idNumber: data.user.idNumber,
        phone: data.user.phone,
        cards: data.user.cards || [],
        addresses: data.user.addresses || []
      });
      
      // Limpiamos carrito y envíos para usuarios reales (o cargamos los de la BD)
      setCart([]);
      setShipments([]);
      
      setView('home');
      setIsLoggedIn(true);

      // Si le falta información, mostramos la alerta que creamos antes
      if (!data.user.cards?.length || !data.user.addresses?.length) {
        setTimeout(() => setShowProfileAlert(true), 1500);
      }
    } else {
      // AQUÍ ES DONDE BLOQUEAMOS EL ACCESO
      alert(data.message || "Usuario o contraseña incorrectos");
    }
  } catch (error) {
    alert("Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.");
  }
};

  const handleRegister = async () => {
    if (!email || !password || !name || !idNumber || !phone) {
      alert("Por favor completa todos los campos para el registro");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, idNumber, phone })
      });
      const data = await response.json();
      if (response.ok) {
        alert("¡Cuenta creada con éxito!");
        setIsRegisterMode(false); 
      } else {
        alert(data.message || "Error al registrar");
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    }
  };

  // --- 4. LÓGICA DE CARRITO ---
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const toggleSelect = (id) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const selectedItems = cart.filter(item => item.selected);
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1, selected: true }];
    });
    setView('cart'); // Esto lleva al usuario a la pestaña del carrito
  };
  const totalPrice = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // --- 5. COMPONENTES POPUP ---
  const NotificationsPopup = () => (
    <div className={`modal fade ${showNotifications ? 'show d-block' : ''}`} tabIndex="-1" style={{background: 'rgba(0,0,0,0.5)'}} onClick={() => setShowNotifications(false)}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content rounded-5 border-0 shadow-lg text-center p-4">
          <div className="modal-header border-0 justify-content-end p-0"><button type="button" className="btn-close" onClick={() => setShowNotifications(false)}></button></div>
          <div className="modal-body py-4">
              <i className="bi bi-bell-slash text-muted mb-4" style={{fontSize: '4rem'}}></i>
              <h5 className="fw-bold mb-3">Notificaciones</h5>
              <p className="text-secondary small px-3">Disculpa, en este momento no tienes notificaciones disponibles.</p>
          </div>
          <div className="modal-footer border-0 justify-content-center p-0 mt-3">
              <button className="btn btn-navy rounded-pill px-5 text-white small" onClick={() => setShowNotifications(false)}>Entendido</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileAlertPopup = () => (
    <div className={`modal fade ${showProfileAlert ? 'show d-block' : ''}`} tabIndex="-1" style={{background: 'rgba(0,0,0,0.7)'}} onClick={() => setShowProfileAlert(false)}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-5 border-0 p-4 text-center">
          <i className="bi bi-exclamation-circle text-warning mb-3" style={{fontSize: '3rem'}}></i>
          <h5 className="fw-bold">¡Completa tu perfil!</h5>
          <p className="small text-muted">Para realizar compras, es necesario que registres un medio de pago y una dirección en la pestaña de Cuenta.</p>
          <button className="btn btn-navy rounded-pill w-100 text-white" onClick={() => {setShowProfileAlert(false); setView('profile');}}>Ir a mi Cuenta</button>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <section id="login-section" className="d-flex align-items-center justify-content-center" style={{height: '100vh', background: '#000033', position: 'relative', overflow: 'hidden'}}>
        <div className="login-bg-curve-top"></div>
        <div className="text-center" style={{zIndex: 10, width: '90%', maxWidth: '400px'}}>
          <img src="/logo_mockup.png" alt="Logo" className="img-fluid mb-4" style={{maxWidth: '160px'}}/>
          <div className="card p-4 shadow-lg border-0 rounded-5">
            <h5 className="fw-bold mb-3 text-navy">{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h5>
            {isRegisterMode && (
              <>
                <input type="text" className="form-control rounded-pill mb-2 border-secondary" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
                <input type="text" className="form-control rounded-pill mb-2 border-secondary" placeholder="ID" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
                <input type="text" className="form-control rounded-pill mb-2 border-secondary" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} />
              </>
            )}
            <input type="email" className="form-control rounded-pill mb-2 border-secondary" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" className="form-control rounded-pill mb-3 border-secondary" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn btn-navy w-100 rounded-pill text-white fw-bold py-2 mb-2" style={{background: '#000033'}} onClick={isRegisterMode ? handleRegister : handleLogin}>
              {isRegisterMode ? 'Finalizar Registro' : 'Ingresar'}
            </button>
            <small className="text-muted mt-2 d-block clickable text-center" onClick={() => setIsRegisterMode(!isRegisterMode)} style={{cursor: 'pointer'}}>
              {isRegisterMode ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="app-section" style={{ background: '#fff', minHeight: '100vh' }}>
      <header className="app-header bg-white shadow-sm px-3 py-2 d-flex align-items-center fixed-top">
        <div className="flex-grow-1 me-3">
          <input type="text" className="form-control rounded-pill bg-light border-0 ps-4 text-center small" placeholder="Buscar productos" />
        </div>
        <i className="bi bi-bell fs-4 clickable nav-icon text-secondary" onClick={() => setShowNotifications(true)}></i>
      </header>

      <main className="container mt-5 pt-5 mb-5 pb-5">
        {view === 'home' && <HomeViewSimulated setView={setView} addToCart={addToCart}/>}
        {view === 'cart' && <CartViewSimulated setView={setView} cart={cart} updateQty={updateQty} toggleSelect={toggleSelect} selectedItems={selectedItems} totalPrice={totalPrice} userProfile={userProfile} />}
        {view === 'envios' && <EnviosViewSimulated setView={setView} shipments={shipments} />}
        {view === 'history' && <HistoryViewSimulated setView={setView} />}
        {view === 'profile' && <ProfileView userProfile={userProfile} setUserProfile={setUserProfile} editMode={editMode} setEditMode={setEditMode} setIsLoggedIn={setIsLoggedIn}/>}
      </main>

      <nav className="navbar fixed-bottom bg-navy shadow-lg py-2">
        <div className="container-fluid d-flex justify-content-around align-items-center">
          <i className={`bi bi-cart fs-4 nav-icon ${view === 'cart' ? 'text-white' : 'text-secondary'}`} onClick={() => setView('cart')}></i>
          <i className={`bi bi-truck fs-4 nav-icon ${view === 'envios' ? 'text-white' : 'text-secondary'}`} onClick={() => setView('envios')}></i>
          <div className="home-circle shadow" onClick={() => setView('home')}><i className="bi bi-house-door-fill text-white fs-3"></i></div>
          <i className={`bi bi-clock-history fs-4 nav-icon ${view === 'history' ? 'text-white' : 'text-secondary'}`} onClick={() => setView('history')}></i>
          <i className={`bi bi-person fs-4 nav-icon ${view === 'profile' ? 'text-white' : 'text-secondary'}`} onClick={() => setView('profile')}></i>
        </div>
      </nav>

      <NotificationsPopup />
      <ProfileAlertPopup />
    </section>
  );
}

// --- 6. SUB-COMPONENTES ACTUALIZADOS ---

const HomeViewSimulated = ({setView, addToCart}) => (
    <div id="view-home" className="view-section">
      <h6 className="fw-bold text-center mb-3 small">Ofertas del día</h6>
      <div className="card gradient-border-container mb-4 p-2 shadow-sm">
        <div className="row g-0">
          <div className="col-6 text-center border-end p-2 d-flex flex-column justify-content-between">
            <div>
              <span className="badge bg-light text-dark border rounded-pill mb-2 small">Macbook Pro 14 Inch</span>
              <div className="ratio ratio-4x3 mb-2 rounded overflow-hidden bg-light shadow-sm">
                <video autoPlay loop muted playsInline className="w-100 h-100 object-fit-cover">
                  <source src="/video_macbook.mp4" type="video/mp4" />
                </video>
              </div>
            <p className="small">Portátil de alto rendimiento diseñado para profesionales, destacando por su equilibrio entre portabilidad y potencia extrema gracias a los chips de la serie M (Pro/Max) de Apple. Cuenta con una impresionante pantalla Liquid Retina XDR (Mini-LED) de 120Hz, excelente duración de batería, y una amplia variedad de puertos (Thunderbolt 4, HDMI, SDXC).</p>
            <p className="fw-bold small mb-1">$3.249.000 <span className="text-danger">-32%</span></p>
            </div>
            <button className="btn btn-sm btn-primary rounded-pill w-100" onClick={() => addToCart({ id: 101, name: "Macbook Pro 14 Inch", price: 3249000, qty: 1, discount: "-32%", shipping: "Gratis", img: "/img_mackbook.png" })}> Agregar <i className="bi bi-cart-plus"></i></button>
          </div>
          <div className="col-6 text-center p-2 d-flex flex-column justify-content-between">
            <div>
              <span className="badge bg-light text-dark border rounded-pill mb-2 small">Llanta Michelin Road 6</span>
              <div className="ratio ratio-4x3 mb-2 rounded overflow-hidden bg-light shadow-sm">
                <video autoPlay loop muted playsInline className="w-100 h-100 object-fit-cover">
                  <source src="/video_llanta.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="small">Llanta sport-touring de alto rendimiento para motos (naked, trail, deportivas), que destaca por ofrecer un 15% más de agarre en mojado y un 10% más de durabilidad que su predecesora, la Road 5. Utiliza tecnología 100% sílice y un diseño optimizado para lluvia, ideal para uso diario o viajes largos.</p>
              <p className="fw-bold small mb-1">$879.990 <span className="text-danger">-17%</span></p>
            </div>
            <button className="btn btn-sm btn-primary rounded-pill w-100" onClick={() => addToCart({ id: 102, name: "Llanta Michelin Road 6", price: 879990, qty: 1, discount: "-17%", shipping: "Gratis", img: "/img_michelin.jpg" })}> Agregar <i className="bi bi-cart-plus"></i></button>
          </div>
        </div>
      </div>
      {/* Categorías */}
      {[
        { name: 'Tecnología', icons: ['phone', 'pc-display', 'headphones'] },
        { name: 'Vehículos', icons: ['gear-wide-connected', 'car-front', 'fuel-pump'] },
        { name: 'Hogar', icons: ['pencil', 'door-open', 'lamp'] }
      ].map((cat, idx) => (
        <div key={idx} className="mb-4 text-center">
          <h6 className="fw-bold small mb-2">{cat.name}</h6>
          <div className="category-pill d-flex justify-content-around align-items-center p-3 shadow-sm rounded-pill border border-warning">
            {cat.icons.map(icon => <i key={icon} className={`bi bi-${icon} fs-4 text-secondary`}></i>)}
          </div>
        </div>
      ))}
    </div>
);

const CartViewSimulated = ({setView, cart, updateQty, toggleSelect, selectedItems, totalPrice, userProfile}) => (
  <div className="view-section">
    <span className="badge rounded-pill bg-light text-dark border px-3 mb-3 small">Carrito de compras</span>
    {cart.length === 0 ? (
      <div className="card p-5 border-purple rounded-4 text-center text-muted shadow-sm">
        <i className="bi bi-cart-x fs-1 mb-2"></i>
        <p className="small">Tu carrito está vacío.</p>
        <button className="btn btn-link btn-sm text-decoration-none" onClick={() => setView('home')}>Ver productos</button>
      </div>
    ) : (
      <div className="card p-3 mb-3 border-purple shadow-sm rounded-4">
        {cart.map(item => (
          <div key={item.id} className="d-flex align-items-center mb-3 border-bottom pb-2">
            <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} className="me-2" />
            <img src={item.img} alt={item.name} className="img-fluid rounded me-2" style={{width: '60px', height: '60px', objectFit: 'contain'}} />
            <div className="flex-grow-1 small">
              <div className="fw-bold">{item.name}</div>
              <div>${item.price.toLocaleString()} <span className="text-danger">{item.discount}</span></div>
            </div>
            <div className="d-flex align-items-center border rounded-pill px-2">
              <span className="px-2 clickable" onClick={() => updateQty(item.id, -1)}>-</span>
              <span className="px-1 fw-bold">{item.qty}</span>
              <span className="px-2 clickable" onClick={() => updateQty(item.id, 1)}>+</span>
            </div>
          </div>
        ))}
        <div className="text-center mt-2 small fw-bold clickable text-primary" onClick={() => setView('home')}>Comprar más</div>
      </div>
    )}

    <div className="card p-3 mb-2 border-purple shadow-sm rounded-4">
        <div className="small fw-bold mb-3"><i className="bi bi-cash-stack me-2 text-primary"></i> Medios de Pago Autorizados</div>
        <div className="d-flex justify-content-around text-center small text-secondary">
          <i className="bi bi-credit-card-2-front fs-2 text-primary"></i>
          <i className="bi bi-credit-card fs-2 text-danger"></i>
          <span className="small text-danger fw-bold pt-2">Rappi</span>
          <i className="bi bi-wallet2 fs-2 text-success"></i>
        </div>
    </div>
    
    <div className="card p-3 mb-3 border-purple shadow-sm rounded-4">
        <div className="small fw-bold mb-2"><i className="bi bi-check-circle me-2 text-success"></i> Tus medios de pago registrados</div>
        <div className="small text-muted">
          <i className="bi bi-credit-card me-2"></i> 
          {userProfile.cards.length > 0 ? `Tarjeta ${userProfile.cards[0]}` : 'No hay tarjetas registradas'}
        </div>
    </div>

    <div className="card p-3 mb-5 border-purple shadow-sm rounded-4 bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <div className="small">
          <div className="text-muted">{selectedItems.length} artículos seleccionados</div>
        </div>
        <button className="btn btn-purple-gradient rounded-pill px-4 text-white fw-bold">Pagar ${totalPrice.toLocaleString()}</button>
      </div>
    </div>
  </div>
);

const EnviosViewSimulated = ({setView, shipments}) => (
  <div className="view-section">
    <span className="badge rounded-pill bg-light text-dark border px-3 mb-3 small">Listado de envíos</span>
    
    {shipments.length === 0 ? (
      <div className="card p-5 border-purple rounded-4 text-center text-muted shadow-sm mb-3">
        <i className="bi bi-box-seam fs-1 mb-2"></i>
        <p className="small">Aún no tienes envíos en curso.</p>
      </div>
    ) : (
      <div className="card p-3 mb-2 border-purple rounded-4 shadow-sm">
        {shipments.map(envio => (
          <div key={envio.id} className="d-flex align-items-center mb-3 pb-2 border-bottom">
            <img src={envio.img} alt={envio.name} className="img-fluid rounded me-3" style={{width: '60px'}} />
            <div className="small">
                <div className="badge bg-light text-dark border mb-1">{envio.name}</div>
                <div className="fw-bold">Valor: {envio.price}</div>
                <div className="small text-muted">Entrega: {envio.date}</div>
            </div>
          </div>
        ))}
      </div>
    )}
    
    <div className="d-flex justify-content-between small fw-bold px-2 mb-3 text-primary">
      <span className="clickable" onClick={() => setView('home')}>Comprar más</span>
      <span className="clickable" onClick={() => setView('history')}>Historial</span>
    </div>

    <div className="card p-2 border-purple rounded-4 text-center shadow-sm">
        <div className="small mb-1 fw-bold"><i className="bi bi-search text-secondary"></i> Rastreo en tiempo real</div>
        <div className="ratio ratio-21x9 rounded overflow-hidden">
            <img src="/img_mapa.jpg" alt="Mapa" className="img-fluid object-fit-cover rounded" />
        </div>
    </div>
  </div>
);

const HistoryViewSimulated = ({setView}) => (
  <div className="view-section">
    <span className="badge rounded-pill bg-light text-dark border px-3 mb-3 small">Historial de compras</span>
    <div className="card p-4 border-purple rounded-4 text-muted text-center mb-4 shadow-sm">No hay registro de compras pasadas.</div>
    
    {/* Nuevo diseño de Soporte Técnico idéntico a la imagen */}
    <div className="p-1 rounded-4 shadow-sm mb-3" style={{ background: 'linear-gradient(to right, #b200ff, #ffaa00)' }}>
      <div className="bg-white rounded-4 p-3 w-100 h-100">
          <div className="d-flex align-items-center justify-content-start mb-3">
              <i className="bi bi-incognito fs-2 me-3 p-2 bg-light rounded-circle text-dark"></i>
              <span className="fw-bold fs-5">¿No encuentras tu pedido?</span>
        </div>
        <div className="row text-center mt-3">
            <div className="col-6">
                <i className="bi bi-headset fs-1 d-block mb-1 text-dark"></i>
                <span className="small fw-bold" style={{fontSize: '11px'}}>01 8000 42169 ext 12</span>
            </div>
            <div className="col-6">
                <i className="bi bi-envelope-fill fs-1 d-block mb-1 text-dark"></i>
                <span className="small fw-bold" style={{fontSize: '11px'}}>smileshop@onlinestore.com</span>
            </div>
        </div>
      </div>
    </div>

    <button className="btn btn-navy rounded-pill w-100 text-white mt-2 fw-bold" onClick={() => setView('home')}>Volver a comprar</button>
  </div>
);

const ProfileView = ({userProfile, setUserProfile, editMode, setEditMode, setIsLoggedIn}) => {
  // Función para agregar direcciones (ya la tenías)
  const addAddress = () => {
    const newAddress = window.prompt("Ingresa la nueva dirección:");
    if (newAddress && newAddress.trim() !== "") {
      setUserProfile({...userProfile, addresses: [...userProfile.addresses, { id: Date.now(), text: newAddress, active: true }]});
    }
  };

  const removeAddress = (idToRemove) => {
    setUserProfile({...userProfile, addresses: userProfile.addresses.filter(a => a.id !== idToRemove)});
  };

  // NUEVA Función para agregar tarjetas
  const addCard = () => {
    const newCard = window.prompt("Ingresa los últimos 4 dígitos de tu tarjeta (ej: ****1234):");
    if (newCard && newCard.trim() !== "") {
      // Formateamos para que siempre tenga los asteriscos por seguridad visual
      const formattedCard = newCard.includes('*') ? newCard : `****${newCard}`;
      setUserProfile({...userProfile, cards: [...userProfile.cards, formattedCard]});
    }
  };

  // NUEVA Función para eliminar tarjetas (opcional, pero buena práctica)
  const removeCard = (cardToRemove) => {
    setUserProfile({...userProfile, cards: userProfile.cards.filter(c => c !== cardToRemove)});
  };

  return (
    <div className="view-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge rounded-pill bg-light text-dark border px-3 small">Cuenta</span>
      </div>

      <div className="card p-3 mb-3 border-purple shadow-sm rounded-4">
        <div className="d-flex align-items-center mb-2">
            <i className="bi bi-person-circle fs-1 me-3 text-secondary"></i>
            <div className="flex-grow-1">
                {editMode === 'info' ? (
                  <div className="mt-1">
                    <input className="form-control form-control-sm mb-1" placeholder="Nombre" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}/>
                    <input className="form-control form-control-sm mb-1" placeholder="ID" value={userProfile.idNumber} onChange={(e) => setUserProfile({...userProfile, idNumber: e.target.value})}/>
                    <input className="form-control form-control-sm mb-1" placeholder="Teléfono" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}/>
                  </div>
                ) : (
                  <>
                    <div className="fw-bold small">{userProfile.name || "Usuario"}</div>
                    <div className="text-muted" style={{fontSize: '11px'}}>ID: {userProfile.idNumber} | Tel: {userProfile.phone}</div>
                  </>
                )}
            </div>
        </div>
        <div className="text-center small text-primary border-top pt-2 clickable fw-bold" onClick={() => setEditMode(editMode === 'info' ? null : 'info')}>
            {editMode === 'info' ? "Guardar cambios" : "Ajustes de cuenta"}
        </div>
      </div>

      {/* Sección de Medios de Pago Actualizada */}
      <div className="card p-3 mb-3 border-purple shadow-sm rounded-4">
        <div className="fw-bold small mb-2"><i className="bi bi-credit-card me-2 text-success"></i> Medios de pago</div>
        
        {userProfile.cards.length > 0 ? userProfile.cards.map((card, i) => (
          <div key={i} className="d-flex justify-content-between align-items-center small mb-1 pb-1 border-bottom">
            <span><i className="bi bi-credit-card me-2 text-secondary"></i> Tarjeta {card}</span>
            <i className="bi bi-trash text-danger clickable" onClick={() => removeCard(card)}></i>
          </div>
        )) : <div className="small text-muted mb-2">No hay tarjetas registradas</div>}
        
        <div className="text-center small text-primary border-top pt-2 mt-2 clickable fw-bold" onClick={addCard}>
          + Agregar nueva tarjeta
        </div>
      </div>

      <div className="card p-3 mb-3 border-purple shadow-sm rounded-4">
        <div className="fw-bold small mb-2"><i className="bi bi-geo-alt me-2 text-danger"></i> Direcciones</div>
        
        {userProfile.addresses.length > 0 ? userProfile.addresses.map((addr) => (
          <div key={addr.id} className="d-flex justify-content-between align-items-center small mb-1 pb-1 border-bottom">
            <span><i className="bi bi-geo-alt me-2 text-secondary"></i> {addr.text}</span>
            <i className="bi bi-trash text-danger clickable" onClick={() => removeAddress(addr.id)}></i>
          </div>
        )) : <div className="small text-muted mb-2">No tienes direcciones registradas</div>}
        
        <div className="text-center small text-primary border-top pt-2 mt-2 clickable fw-bold" onClick={addAddress}>
          + Agregar nueva dirección
        </div>
      </div>

      <button onClick={() => setIsLoggedIn(false)} className="btn btn-outline-danger rounded-pill w-100 py-2 mt-3 fw-bold">Cerrar Sesión</button>
    </div>
  );
};
export default App;