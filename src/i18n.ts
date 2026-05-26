import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "missions": "Urgent Missions",
        "impact": "Our Impact",
        "transparency": "Transparency",
        "actionHub": "Action Hub",
        "donate": "DONATE NOW"
      },
      "hero": {
        "live": "Live Relief Active",
        "title": "Rebuilding Cities,",
        "subtitle": "Bridging Nations.",
        "description": "Humanitarian fintech-style disaster relief providing transparent, real-time aid for communities in Brazil and the USA.",
        "cta": "Send Relief Now"
      },
      "donation": {
        "quick": "Quick Donation",
        "other": "Other amount",
        "secure": "Secured via BridgeTech Protocol",
        "proceed": "PROCEED TO SECURE PAY"
      },
      "missions": {
        "title": "Urgent Missions",
        "active": "Active Response",
        "viewAll": "View All Missions",
        "support": "Support Mission",
        "raised": "raised",
        "goal": "Goal",
        "funded": "FUNDED",
        "rio": {
          "tag": "BRAZIL RELIEF",
          "title": "Rio Grande do Sul Recovery",
          "desc": "Rebuilding essential clean water infrastructure and housing for 5,000+ displaced families."
        },
        "gulf": {
          "tag": "USA RESILIENCE",
          "title": "Gulf Coast Resilience",
          "desc": "Implementing advanced early warning systems and solar-powered community centers."
        },
        "amazon": {
          "tag": "AMAZON RELIEF",
          "title": "Amazon Basin Relief",
          "desc": "Medical logistics and satellite connectivity for remote riverside communities in crisis."
        }
      },
      "transparency": {
        "title": "Transparency Through Fintech",
        "subtitle": "Real-time accountability of every dollar deployed to disaster relief in Brazil and the USA. Our commitment is 100% visibility.",
        "deployed": "Total Relief Deployed",
        "impacted": "Lives Impacted",
        "raised": "Total Raised",
        "overhead": "Admin Overhead",
        "overheadDesc": "Leading the humanitarian industry",
        "ledger": "Transaction Ledger (Live)",
        "liveFeed": "LIVE FEED",
        "liveLedger": "Live Ledger Feed",
        "audit": "View Audit Log",
        "dna": "Transparency is our DNA.",
        "instant": "Instant Transfers",
        "instantDesc": "We use fintech rails to deliver cash directly to verified families in need within hours, not weeks.",
        "map": "Real-time Impact Map",
        "mapDesc": "Track every dollar spent through our live ledger and interactive mission updates.",
        "crossBorder": "Cross-Border Relief",
        "crossBorderDesc": "Seamlessly moving resources between the USA and Brazil with zero-fee structures.",
        "liveMap": "Live Mission Map",
        "liveMapDesc": "Interactive view of all current aid distributions across North and South America.",
        "explore": "Explore Global Impact",
        "flowTitle": "Fund Flow Analysis",
        "flowSubtitle": "Tracing USD/BRL conversion to local impact zones",
        "chartIncoming": "USD INCOMING",
        "chartConversion": "FX CONVERSION (BRL)",
        "chartDeployed": "RELIEF DEPLOYED",
        "download": "Download 2023 Annual Report"
      },
      "footer": {
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "reports": "Financial Reports",
        "contact": "Contact",
        "rights": "© 2024 Building Bridges Non-Profit Organization. All rights reserved. Registered 501(c)(3)."
      },
      "projects": {
        "title": "Active Humanitarian Projects",
        "subtitle": "Browse our active and completed humanitarian missions",
        "loading": "Loading...",
        "filter": "Filter",
        "all": "All Missions",
        "active": "Active Only",
        "completed": "Completed",
        "archive": "Archive",
        "notfound": "No missions found matching this filter."
      },
      "impact": {
        "story": "The Story",
        "budget": "Budget Breakdown",
        "gallery": "Gallery",
        "location": "Location",
        "funding": "Funding Status",
        "notfound": "Mission not found.",
        "back": "Back to Missions",
        "support": "Support this Mission",
        "impactZones": "Impact Zones"
      },
      "admin": {
        "title": "Admin Console",
        "subtitle": "Register new humanitarian missions",
        "form": {
          "name": "Mission Name",
          "category": "Category Tag",
          "status": "Mission Status",
          "desc": "Short Description (for cards)",
          "goal": "Goal Amount (USD)",
          "image": "Mission Image",
          "upload": "Click to upload image",
          "story": "Case Study / The Story (Long text)",
          "budget": "Budget Breakdown",
          "addItem": "Add Item",
          "publish": "Publish Mission",
          "creating": "Creating..."
        }
      },
      "checkout": {
        "title": "Complete your Donation",
        "subtitle": "Your contribution provides immediate relief to disaster-stricken areas.",
        "pix": "BRL (Pix)",
        "card": "USD (Card)",
        "scan": "Scan Pix QR Code",
        "scanDesc": "Open your bank app and point the camera at the code to complete your BRL donation securely via Pix.",
        "copy": "Copy Pix Key",
        "verified": "Instant confirmation available",
        "cardInfo": "Card Information",
        "cardNumber": "Card Number",
        "expiry": "Expiry Date",
        "cvc": "CVC",
        "complete": "Complete Donation",
        "impact": "Your Impact Today",
        "impactDesc": "Based on your selection, this donation will provide approximately <0>50 nutritious meals</0> to families displaced by the Rio Grande do Sul floods."
      },
      "auth": {
        "staffLogin": "Staff Login",
        "accessConsole": "Access NGO Management Console",
        "email": "Email Address",
        "password": "Password",
        "forgotPassword": "Forgot Password?",
        "signIn": "Sign In",
        "authenticating": "Authenticating...",
        "registerTeam": "Join the team?",
        "registerHere": "Register here",
        "registration": "Staff Registration",
        "provisionPortal": "Create your humanitarian portal account",
        "fullName": "Full Name",
        "minChars": "Min. 6 characters required",
        "creatingAccount": "Creating Account...",
        "register": "Register",
        "alreadyHaveAccount": "Already have an account?",
        "loginHere": "Log in here",
        "recovery": "Recovery",
        "resetPassword": "Reset your account password",
        "sendReset": "Send Reset Link",
        "sendingRequest": "Sending Request...",
        "backToLogin": "Back to Login",
        "resetSuccess": "Password reset email sent! Check your inbox."
      }
    }
  },
  pt: {
    translation: {
      "nav": {
        "home": "Início",
        "missions": "Missões Urgentes",
        "impact": "Nosso Impacto",
        "transparency": "Transparência",
        "actionHub": "Hub de Ação",
        "donate": "DOE AGORA"
      },
      "hero": {
        "live": "Ajuda ao Vivo Ativa",
        "title": "Reconstruindo Cidades,",
        "subtitle": "Unindo Nações.",
        "description": "Ajuda humanitária estilo fintech para desastres, fornecendo auxílio transparente e em tempo real para comunidades no Brasil e nos EUA.",
        "cta": "Enviar Ajuda Agora"
      },
      "donation": {
        "quick": "Doação Rápida",
        "other": "Outro valor",
        "secure": "Protegido via Protocolo BridgeTech",
        "proceed": "PROSSEGUIR PARA PAGAMENTO SEGURO"
      },
      "missions": {
        "title": "Missões Urgentes",
        "active": "Resposta Ativa",
        "viewAll": "Ver Todas as Missões",
        "support": "Apoiar Missão",
        "raised": "arrecadado",
        "goal": "Meta",
        "funded": "FINANCIADO",
        "rio": {
          "tag": "ALÍVIO BRASIL",
          "title": "Recuperação do Rio Grande do Sul",
          "desc": "Reconstruindo infraestrutura essencial de água limpa e habitação para mais de 5.000 famílias deslocadas."
        },
        "gulf": {
          "tag": "RESILIÊNCIA EUA",
          "title": "Resiliência na Costa do Golfo",
          "desc": "Implementando sistemas avançados de alerta precoce e centros comunitários movidos a energia solar."
        },
        "amazon": {
          "tag": "ALÍVIO AMAZÔNIA",
          "title": "Alívio na Bacia Amazônica",
          "desc": "Logística médica e conectividade via satélite para comunidades ribeirinhas remotas em crise."
        }
      },
      "transparency": {
        "title": "Transparência Através de Fintech",
        "subtitle": "Responsabilidade em tempo real de cada centavo usado para alívio de desastres no Brasil e nos EUA. Nosso compromisso é 100% de visibilidade.",
        "deployed": "Total de Ajuda Enviada",
        "impacted": "Vidas Impactadas",
        "raised": "Total Arrecadado",
        "overhead": "Custos Administrativos",
        "overheadDesc": "Liderando a indústria humanitária",
        "ledger": "Livro de Transações (Ao Vivo)",
        "liveFeed": "FEED AO VIVO",
        "liveLedger": "Fluxo do Livro de Razão ao Vivo",
        "audit": "Ver Log de Auditoria",
        "dna": "Transparência é o nosso DNA.",
        "instant": "Transferências Instantâneas",
        "instantDesc": "Usamos infraestrutura fintech para entregar dinheiro diretamente a famílias verificadas em necessidade em horas, não semanas.",
        "map": "Mapa de Impacto em Tempo Real",
        "mapDesc": "Acompanhe cada dólar gasto através do nosso livro-razão ao vivo e atualizações interativas de missões.",
        "crossBorder": "Ajuda Transfronteiriça",
        "crossBorderDesc": "Movimentação contínua de recursos entre os EUA e o Brasil com estruturas de taxa zero.",
        "liveMap": "Mapa de Missões ao Vivo",
        "liveMapDesc": "Visão interativa de todas as distribuições de ajuda atuais na América do Norte e do Sul.",
        "explore": "Explorar Impacto Global",
        "flowTitle": "Análise de Fluxo de Fundos",
        "flowSubtitle": "Rastreando a conversão USD/BRL para zonas de impacto local",
        "chartIncoming": "ENTRADA USD",
        "chartConversion": "CONVERSÃO FX (BRL)",
        "chartDeployed": "AJUDA IMPLEMENTADA",
        "download": "Baixar Relatório Anual 2023"
      },
      "footer": {
        "privacy": "Política de Privacidade",
        "terms": "Termos de Serviço",
        "reports": "Relatórios Financeiros",
        "contact": "Contato",
        "rights": "© 2024 Organização Sem Fins Lucrativos Building Bridges. Todos os direitos reservados. Registrada 501(c)(3)."
      },
      "projects": {
        "title": "Projetos Humanitários Ativos",
        "subtitle": "Explore nossas missões humanitárias ativas e concluídas",
        "loading": "Carregando...",
        "filter": "Filtrar",
        "all": "Todas as Missões",
        "active": "Apenas Ativas",
        "completed": "Concluídas",
        "archive": "Arquivo",
        "notfound": "Nenhuma missão encontrada com este filtro."
      },
      "impact": {
        "story": "A História",
        "budget": "Divisão do Orçamento",
        "gallery": "Galeria",
        "location": "Localização",
        "funding": "Status do Financiamento",
        "notfound": "Missão não encontrada.",
        "back": "Voltar para Missões",
        "support": "Apoiar esta Missão",
        "impactZones": "Zonas de Impacto"
      },
      "admin": {
        "title": "Painel de Controle Administrador",
        "subtitle": "Registrar novas missões humanitárias",
        "form": {
          "name": "Nome da Missão",
          "category": "Etiqueta de Categoria",
          "status": "Status da Missão",
          "desc": "Descrição Curta (para os cartões)",
          "goal": "Valor da Meta (USD)",
          "image": "Imagem da Missão",
          "upload": "Clique para fazer o upload da imagem",
          "story": "Estudo de Caso / A História (Texto longo)",
          "budget": "Divisão do Orçamento",
          "addItem": "Adicionar Item",
          "publish": "Publicar Missão",
          "creating": "Criando..."
        }
      },
      "checkout": {
        "title": "Complete sua Doação",
        "subtitle": "Sua contribuição fornece ajuda imediata para áreas atingidas por desastres.",
        "pix": "BRL (Pix)",
        "card": "USD (Cartão)",
        "scan": "Escaneie o QR Code do Pix",
        "scanDesc": "Abra o aplicativo do seu banco e aponte a câmera para o código para completar sua doação em BRL com segurança via Pix.",
        "copy": "Copiar Chave Pix",
        "verified": "Confirmação instantânea disponível",
        "cardInfo": "Informações do Cartão",
        "cardNumber": "Número do Cartão",
        "expiry": "Data de Validade",
        "cvc": "CVC",
        "complete": "Completar Doação",
        "impact": "Seu Impacto Hoje",
        "impactDesc": "Com base na sua seleção, esta doação fornecerá aproximadamente <0>50 refeições nutritivas</0> para famílias deslocadas pelas enchentes no Rio Grande do Sul."
      },
      "auth": {
        "staffLogin": "Login da Equipe",
        "accessConsole": "Acessar Console de Gestão da ONG",
        "email": "Endereço de E-mail",
        "password": "Senha",
        "forgotPassword": "Esqueceu a senha?",
        "signIn": "Entrar",
        "authenticating": "Autenticando...",
        "registerTeam": "Juntar-se à equipe?",
        "registerHere": "Registre-se aqui",
        "registration": "Cadastro da Equipe",
        "provisionPortal": "Crie sua conta no portal humanitário",
        "fullName": "Nome Completo",
        "minChars": "Mín. 6 caracteres obrigatórios",
        "creatingAccount": "Criando Conta...",
        "register": "Registrar",
        "alreadyHaveAccount": "Já tem uma conta?",
        "loginHere": "Faça login aqui",
        "recovery": "Recuperação",
        "resetPassword": "Redefina a senha da sua conta",
        "sendReset": "Enviar Link de Redefinição",
        "sendingRequest": "Enviando Solicitação...",
        "backToLogin": "Voltar para o Login",
        "resetSuccess": "E-mail de redefinição de senha enviado! Verifique sua caixa de entrada."
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "home": "Inicio",
        "missions": "Misiones Urgentes",
        "impact": "Nuestro Impacto",
        "transparency": "Transparencia",
        "actionHub": "Hub de Acción",
        "donate": "DONA AHORA"
      },
      "hero": {
        "live": "Ayuda en Vivo Activa",
        "title": "Reconstruyendo Ciudades,",
        "subtitle": "Uniendo Naciones.",
        "description": "Ayuda humanitaria estilo fintech para desastres, proporcionando auxilio transparente y en tiempo real para comunidades en Brasil y EE. UU.",
        "cta": "Enviar Ayuda Ahora"
      },
      "donation": {
        "quick": "Donación Rápida",
        "other": "Otro monto",
        "secure": "Protegido vía Protocolo BridgeTech",
        "proceed": "CONTINUAR AL PAGO SEGURO"
      },
      "missions": {
        "title": "Misiones Urgentes",
        "active": "Respuesta Ativa",
        "viewAll": "Ver Todas las Misiones",
        "support": "Apoyar Misión",
        "raised": "recaudado",
        "goal": "Meta",
        "funded": "FINANCIADO",
        "rio": {
          "tag": "ALIVIO BRASIL",
          "title": "Recuperación de Rio Grande do Sul",
          "desc": "Reconstruyendo infraestructura esencial de agua limpia y vivienda para más de 5,000 familias desplazadas."
        },
        "gulf": {
          "tag": "RESILIENCIA EUA",
          "title": "Resiliencia en la Costa del Golfo",
          "desc": "Implementando sistemas avanzados de alerta temprana y centros comunitarios con energía solar."
        },
        "amazon": {
          "tag": "ALIVIO AMAZONÍA",
          "title": "Alivio en la Cuenca Amazónica",
          "desc": "Logística médica y conectividad satelital para comunidades ribereñas remotas en crisis."
        }
      },
      "transparency": {
        "title": "Transparencia a Través de Fintech",
        "subtitle": "Responsabilidad en tiempo real de cada dólar desplegado para el alivio de desastres en Brasil y los EE. UU. Nuestro compromiso é 100% visibilidad.",
        "deployed": "Total de Ayuda Desplegada",
        "impacted": "Vidas Impactadas",
        "raised": "Total Recaudado",
        "overhead": "Gastos Administrativos",
        "overheadDesc": "Liderando la industria humanitaria",
        "ledger": "Libro de Transacciones (En Vivo)",
        "liveFeed": "FEED EN VIVO",
        "liveLedger": "Flujo del Libro Mayor en Vivo",
        "audit": "Ver Log de Auditoría",
        "dna": "La transparencia es nuestro ADN.",
        "instant": "Transferencias Instantáneas",
        "instantDesc": "Utilizamos infraestructura fintech para entregar dinero directamente a familias verificadas en necesidad en horas, no semanas.",
        "map": "Mapa de Impacto en Tiempo Real",
        "mapDesc": "Siga cada dólar gastado a través de nuestro libro de contabilidad en vivo y actualizaciones interactivas de misiones.",
        "crossBorder": "Ayuda Transfronteriza",
        "crossBorderDesc": "Movimiento fluido de recursos entre EE. UU. y Brasil con estructuras de tarifa cero.",
        "liveMap": "Mapa de Misiones en Vivo",
        "liveMapDesc": "Vista interactiva de todas las distribuciones de ayuda actuales en América del Norte y del Sur.",
        "explore": "Explorar Impacto Global",
        "flowTitle": "Análisis de Flujo de Fondos",
        "flowSubtitle": "Rastreando la conversión USD/BRL a zonas de impacto local",
        "chartIncoming": "ENTRADA USD",
        "chartConversion": "CONVERSIÓN FX (BRL)",
        "chartDeployed": "AYUDA DESPLEGADA",
        "download": "Descargar Informe Anual 2023"
      },
      "footer": {
        "privacy": "Política de Privacidad",
        "terms": "Términos de Servicio",
        "reports": "Informes Financieros",
        "contact": "Contacto",
        "rights": "© 2024 Organización Sin Fines de Lucro Building Bridges. Todos los derechos reservados. Registrada 501(c)(3)."
      },
      "projects": {
        "title": "Proyectos Humanitarios Activos",
        "subtitle": "Explore nuestras misiones humanitarias activas y completadas",
        "loading": "Cargando...",
        "filter": "Filtrar",
        "all": "Todas las Misiones",
        "active": "Solo Activas",
        "completed": "Completadas",
        "archive": "Archivo",
        "notfound": "No se encontraron misiones con este filtro."
      },
      "impact": {
        "story": "La Historia",
        "budget": "Desglose del Presupuesto",
        "gallery": "Galería",
        "location": "Ubicación",
        "funding": "Estado de Financiación",
        "notfound": "Misión no encontrada.",
        "back": "Volver a Misiones",
        "support": "Apoyar esta Misión",
        "impactZones": "Zonas de Impacto"
      },
      "admin": {
        "title": "Consola de Administrador",
        "subtitle": "Registrar nuevas misiones humanitarias",
        "form": {
          "name": "Nombre de la Misión",
          "category": "Etiqueta de Categoría",
          "status": "Estado de la Misión",
          "desc": "Descripción Corta (para tarjetas)",
          "goal": "Monto de la Meta (USD)",
          "image": "Imagen de la Misión",
          "upload": "Haga clic para cargar la imagen",
          "story": "Estudio de Caso / La Historia (Texto largo)",
          "budget": "Desglose del Presupuesto",
          "addItem": "Añadir Item",
          "publish": "Publicar Misión",
          "creating": "Creando..."
        }
      },
      "checkout": {
        "title": "Complete su Donación",
        "subtitle": "Su contribución proporciona alivio inmediato a las zonas afectadas por desastres.",
        "pix": "BRL (Pix)",
        "card": "USD (Tarjeta)",
        "scan": "Escanee el código QR de Pix",
        "scanDesc": "Abra la aplicación de su banco y apunte la cámara al código para completar su donación en BRL de forma segura a través de Pix.",
        "copy": "Copiar clave Pix",
        "verified": "Confirmación instantánea disponible",
        "cardInfo": "Información de la Tarjeta",
        "cardNumber": "Número de Tarjeta",
        "expiry": "Fecha de Vencimiento",
        "cvc": "CVC",
        "complete": "Completar Donación",
        "impact": "Su Impacto Hoy",
        "impactDesc": "Según su selección, esta donación proporcionará aproximadamente <0>50 comidas nutritivas</0> a familias desplazadas por las inundaciones de Rio Grande do Sul."
      },
      "auth": {
        "staffLogin": "Inicio de Sesión del Staff",
        "accessConsole": "Acceder a la Consola de Gestión de la ONG",
        "email": "Correo Electrónico",
        "password": "Contraseña",
        "forgotPassword": "¿Olvidó su contraseña?",
        "signIn": "Iniciar Sesión",
        "authenticating": "Autenticando...",
        "registerTeam": "¿Unirse al equipo?",
        "registerHere": "Regístrese aquí",
        "registration": "Registro del Staff",
        "provisionPortal": "Cree su cuenta en el portal humanitario",
        "fullName": "Nombre Completo",
        "minChars": "Mín. 6 caracteres requeridos",
        "creatingAccount": "Creando Cuenta...",
        "register": "Registrarse",
        "alreadyHaveAccount": "¿Ya tiene una cuenta?",
        "loginHere": "Inicie sesión aquí",
        "recovery": "Recuperación",
        "resetPassword": "Restablezca la contraseña de su cuenta",
        "sendReset": "Enviar Enlace de Restablecimiento",
        "sendingRequest": "Enviando Solicitud...",
        "backToLogin": "Volver al Inicio de Sesión",
        "resetSuccess": "¡Correo electrónico de restablecimiento enviado! Revise su bandeja de entrada."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
