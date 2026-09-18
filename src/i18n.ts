import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "missions": "Urgent Projects",
        "actionHub": "Action Hub",
        "donate": "DONATE NOW",
        "admin": "Admin Panel"
      },
      "hero": {
        "live": "Live Relief Active",
        "title": "Touching Nations,",
        "subtitle": "Changing Lives!",
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
        "title": "Urgent Projects",
        "active": "Active Response",
        "viewAll": "View All Projects",
        "support": "Support Project",
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
        "liveFeed": "LIVE FEED"
      },
      "footer": {
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "reports": "Financial Reports",
        "contact": "Contact",
        "legal": "Legal Notice",
        "rights": "Building Bridges Foundation BR-USA is a nonprofit corporation of the State of Georgia. Federal 501(c)(3) exemption is still pending. Do not treat donations as deductible for U.S. income tax purposes until the IRS issues the recognition letter."
      },
      "projects": {
        "title": "Active Humanitarian Projects",
        "subtitle": "Browse our active and completed humanitarian projects",
        "loading": "Loading...",
        "filter": "Filter",
        "all": "All Projects",
        "active": "Active Only",
        "completed": "Completed",
        "archive": "Archive",
        "notfound": "No projects found matching this filter."
      },
      "impact": {
        "story": "The Story",
        "budget": "Budget Breakdown",
        "gallery": "Gallery",
        "location": "Location",
        "funding": "Funding Status",
        "notfound": "Project not found.",
        "back": "Back to Projects",
        "support": "Support this Project",
        "impactZones": "Impact Zones"
      },
      "admin": {
        "title": "Admin Console",
        "subtitle": "Register new humanitarian projects",
        "form": {
          "name": "Project Name",
          "category": "Category Tag",
          "status": "Project Status",
          "desc": "Short Description (for cards)",
          "goal": "Goal Amount (USD)",
          "image": "Project Image",
          "upload": "Click to upload image",
          "story": "Case Study / The Story (Long text)",
          "budget": "Budget Breakdown",
          "addItem": "Add Item",
          "publish": "Publish Project",
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
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Touching Nations, Changing Lives",
          "description": "Humanitarian disaster relief and support for families in need, disaster-stricken cities, and vulnerable individuals. Rebuilding cities, bridging nations."
        },
        "projects": {
          "title": "Humanitarian Projects | Building Bridges",
          "description": "Explore our active and completed humanitarian projects. Your donation provides transparent disaster relief in real-time."
        },
        "initiatives": {
          "title": "Action Hub & Urgent Projects | Building Bridges",
          "description": "Find out where we are acting right now. Urgent humanitarian response campaigns in Brazil and the United States."
        },
        "impact": {
          "title": "Our Social Impact | Building Bridges",
          "description": "See the direct, verified results of our disaster relief campaigns. Real-time updates, metrics, and case studies of lives changed."
        },
        "contact": {
          "title": "Contact Us | Building Bridges",
          "description": "Get in touch with our humanitarian coordination team in the US and Brazil. Let's build bridges of hope together."
        }
      }
    }
  },
  pt: {
    translation: {
      "nav": {
        "home": "Início",
        "missions": "Projetos Urgentes",
        "actionHub": "Hub de Ação",
        "donate": "DOE AGORA",
        "admin": "Painel Admin"
      },
      "hero": {
        "live": "Ajuda ao Vivo Ativa",
        "title": "Alcançando Nações,",
        "subtitle": "Tocando Vidas!",
        "description": "Ajuda humanitária estilo fintech para desastres, fornecendo auxílio transparente e em tempo real para comunidades no Brasil e nos EUA.",
        "cta": "Enviar Ajuda Agora"
      },
      "donation": {
        "quick": "Doação Rápida",
        "other": "Outro valor",
        "secure": "Protegido via Protocolo BridgeTech",
        "proceed": "DOAÇÃO SEGURA"
      },
      "missions": {
        "title": "Projetos Urgentes",
        "active": "Resposta Ativa",
        "viewAll": "Ver Todos os Projetos",
        "support": "Apoiar Projeto",
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
        "liveFeed": "FEED AO VIVO"
      },
      "footer": {
        "privacy": "Política de Privacidade",
        "terms": "Termos de Serviço",
        "reports": "Relatórios Financeiros",
        "contact": "Contato",
        "legal": "Aviso Legal",
        "rights": "A Building Bridges Foundation BR-USA é uma corporação sem fins lucrativos do Estado da Geórgia. A isenção federal 501(c)(3) ainda está pendente. Não trate as doações como dedutíveis no imposto de renda americano até o IRS emitir a carta de reconhecimento."
      },
      "projects": {
        "title": "Projetos Humanitários Ativos",
        "subtitle": "Explore nossos projetos humanitários ativos e concluídos",
        "loading": "Carregando...",
        "filter": "Filtrar",
        "all": "Todos os Projetos",
        "active": "Apenas Ativas",
        "completed": "Concluídas",
        "archive": "Arquivo",
        "notfound": "Nenhum projeto encontrado com este filtro."
      },
      "impact": {
        "story": "A História",
        "budget": "Divisão do Orçamento",
        "gallery": "Galeria",
        "location": "Localização",
        "funding": "Status do Financiamento",
        "notfound": "Projeto não encontrado.",
        "back": "Voltar para Projetos",
        "support": "Apoiar este Projeto",
        "impactZones": "Zonas de Impacto"
      },
      "admin": {
        "title": "Painel de Controle Administrador",
        "subtitle": "Registrar novos projetos humanitários",
        "form": {
          "name": "Nome do Projeto",
          "category": "Etiqueta de Categoria",
          "status": "Status do Projeto",
          "desc": "Descrição Curta (para os cartões)",
          "goal": "Valor da Meta (USD)",
          "image": "Imagem do Projeto",
          "upload": "Clique para fazer o upload da imagem",
          "story": "Estudo de Caso / A História (Texto longo)",
          "budget": "Divisão do Orçamento",
          "addItem": "Adicionar Item",
          "publish": "Publicar Projeto",
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
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Alcançando Nações, Tocando Vidas",
          "description": "Ajuda humanitária para catástrofes e suporte a famílias em necessidade, cidades atingidas e indivíduos vulneráveis. Reconstruindo cidades, unindo nações."
        },
        "projects": {
          "title": "Projetos Humanitários | Building Bridges",
          "description": "Explore nossos projetos humanitários ativos e concluídos. Sua doação apoia a reconstrução de cidades e o alívio transparente de desastres."
        },
        "initiatives": {
          "title": "Hub de Ação e Projetos Urgentes | Building Bridges",
          "description": "Descubra nossas respostas ativas a crises humanitárias e desastres naturais no Brasil e nos Estados Unidos. Faça a diferença."
        },
        "impact": {
          "title": "Nosso Impacto Social | Building Bridges",
          "description": "Veja os resultados reais e verificados das nossas ações. Histórias reais, dados de conversão e vidas impactadas pela sua ajuda."
        },
        "contact": {
          "title": "Fale Conosco | Building Bridges",
          "description": "Entre em contato com a equipe de coordenação humanitária no Brasil e nos EUA. Juntos, construímos pontes de esperança."
        }
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "home": "Inicio",
        "missions": "Proyectos Urgentes",
        "actionHub": "Hub de Acción",
        "donate": "DONA AHORA",
        "admin": "Panel Admin"
      },
      "hero": {
        "live": "Ayuda en Vivo Activa",
        "title": "Alcanzando Naciones,",
        "subtitle": "¡Tocando Vidas!",
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
        "title": "Proyectos Urgentes",
        "active": "Respuesta Ativa",
        "viewAll": "Ver Todos los Proyectos",
        "support": "Apoyar Proyecto",
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
        "liveFeed": "FEED EN VIVO"
      },
      "footer": {
        "privacy": "Política de Privacidad",
        "terms": "Términos de Servicio",
        "reports": "Informes Financieros",
        "contact": "Contacto",
        "legal": "Aviso Legal",
        "rights": "Building Bridges Foundation BR-USA es una corporación sin fines de lucro del Estado de Georgia. La exención federal 501(c)(3) aún está pendiente. No considere las donaciones como deducibles del impuesto sobre la renta de EE. UU. hasta que el IRS emita la carta de reconocimiento."
      },
      "projects": {
        "title": "Proyectos Humanitarios Activos",
        "subtitle": "Explore nuestros proyectos humanitarios activos y completados",
        "loading": "Cargando...",
        "filter": "Filtrar",
        "all": "Todos los Proyectos",
        "active": "Solo Activas",
        "completed": "Completadas",
        "archive": "Archivo",
        "notfound": "No se encontraron proyectos con este filtro."
      },
      "impact": {
        "story": "La Historia",
        "budget": "Desglose del Presupuesto",
        "gallery": "Galería",
        "location": "Ubicación",
        "funding": "Estado de Financiación",
        "notfound": "Proyecto no encontrado.",
        "back": "Volver a Proyectos",
        "support": "Apoyar este Proyecto",
        "impactZones": "Zonas de Impacto"
      },
      "admin": {
        "title": "Consola de Administrador",
        "subtitle": "Registrar nuevos proyectos humanitarios",
        "form": {
          "name": "Nombre del Proyecto",
          "category": "Etiqueta de Categoría",
          "status": "Estado del Proyecto",
          "desc": "Descripción Corta (para tarjetas)",
          "goal": "Monto de la Meta (USD)",
          "image": "Imagen del Proyecto",
          "upload": "Haga clic para cargar la imagen",
          "story": "Estudio de Caso / La Historia (Texto largo)",
          "budget": "Desglose del Presupuesto",
          "addItem": "Añadir Item",
          "publish": "Publicar Proyecto",
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
        "sendReset": "Enviar Enlace de Redefiniamiento",
        "sendingRequest": "Enviando Solicitud...",
        "backToLogin": "Voltar al Inicio de Sesión",
        "resetSuccess": "¡Correo electrónico de reestablecimiento enviado! Revise su bandeja de entrada."
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Alcanzando Naciones, Tocando Vidas",
          "description": "Ayuda humanitaria para desastres y apoyo a familias necesitadas, ciudades afectadas e individuos vulnerables. Reconstruyendo ciudades, uniendo naciones."
        },
        "projects": {
          "title": "Proyectos Humanitarios | Building Bridges",
          "description": "Explore nuestros proyectos humanitarios activos y completados. Su donación apoya la reconstrucción de ciudades y el alivio transparente de desastres."
        },
        "initiatives": {
          "title": "Hub de Acción y Proyectos Urgentes | Building Bridges",
          "description": "Descubra nuestras respuestas activas a crisis humanitarias y desastres naturales en Brasil y Estados Unidos. Marque la diferencia hoy."
        },
        "impact": {
          "title": "Nuestro Impacto Social | Building Bridges",
          "description": "Vea los resultados reales y verificados de nuestras acciones. Historias reales, datos de conversión y vidas impactadas por su ayuda."
        },
        "contact": {
          "title": "Contáctenos | Building Bridges",
          "description": "Póngase en contacto con el equipo de coordinación humanitaria en Brasil y EE. UU. Juntos, construimos puentes de esperanza."
        }
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
    supportedLngs: ['en', 'pt', 'es'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
