import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "missions": "Urgent Projects",
        "actionHub": "Action Hub",
        "donate": "DONATE NOW",
        "admin": "Admin Panel",
        "menu": "Menu",
        "close": "Close",
        "currency": "Currency",
        "signOut": "Sign Out",
        "staffAccess": "Staff Access"
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
        "contact": "Contact Us",
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
        "impactZones": "Impact Zones",
        "updates": "Updates",
        "raisedOf": "raised of",
        "goal": "Goal",
        "supportTitle": "Support This Mission",
        "supportDesc": "Select your contribution level to provide immediate relief.",
        "customAmount": "Custom Amount",
        "tierBasic": "Basic Support",
        "tierEssential": "Essential Support",
        "tierExpanded": "Amplified Support",
        "contactStep": "Contact Information",
        "contactDesc": "Enter your contact details to receive instant receipt and impact reports.",
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "notes": "Additional Notes or Message",
        "proceedCheckout": "Proceed to Secure Payment",
        "processing": "Processing...",
        "verifiedTitle": "Contribution Verified!",
        "verifiedDesc": "Thank you for your generosity. Your contribution is being deployed directly to humanitarian response.",
        "receiptButton": "View Official Receipt",
        "failTitle": "Validation Failure"
      },
      "initiatives": {
        "badge": "Collective Action Hub",
        "title": "Support with a",
        "titleHighlight": "Solidarity Initiative",
        "subtitle": "Our network of volunteers creates physical products and incredible activities to fund our projects. By participating or acquiring, 100% of net proceeds go directly to sanitation, food, and shelters in the field.",
        "filterAll": "All",
        "filterItems": "Support Symbols (Items)",
        "filterExperiences": "Collective Activities (Experiences)",
        "tagItem": "Support Symbol",
        "tagExperience": "Collective Activity",
        "tagProject": "Project",
        "generalProject": "General Fund",
        "suggestedContribution": "Suggested Contribution",
        "btnAcquire": "Acquire & Support",
        "btnRegister": "Register Solidarily",
        "notFound": "No initiatives found for this category.",
        "validationLoading": "Validating your payment with the secure portal...",
        "validationFailedTitle": "Validation Failure",
        "closeModal": "Close"
      },
      "checkout": {
        "title": "Complete your Donation",
        "subtitle": "Your contribution provides immediate relief to disaster-stricken areas.",
        "breadcrumb": "Donate Now",
        "portalTitle": "Solidarity Support Portal",
        "portalSubtitle": "Your direct contribution reaches families in need in full.",
        "step1": "Destination & Currency",
        "step2": "Contribution Amount",
        "step3": "Contact Information",
        "projectLabel": "Humanitarian Project",
        "currencyLabel": "Currency & Payment Gateway",
        "focusLabel": "Focus:",
        "tierBasic": "Basic Support",
        "tierEssential": "Essential Support",
        "tierExpanded": "Amplified Support",
        "customTier": "Custom Amount",
        "customPlaceholder": "Custom amount",
        "namePlaceholder": "Your full name",
        "emailPlaceholder": "your@email.com",
        "phonePlaceholder": "(11) 99999-9999",
        "notesPlaceholder": "Optional message for the field team...",
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
        "impactDesc": "Based on your selection, this donation will provide approximately {{meals}} nutritious meals or {{kits}} emergency kits to displaced families.",
        "impactShort": "With this contribution, we will provide approximately {{meals}} warm meals to affected families."
      },
      "dashboard": {
        "navTitle": "Navigation",
        "overview": "Overview",
        "taxReceipts": "Tax Receipts",
        "impactReports": "Impact Reports",
        "newReliefTitle": "New Relief Project",
        "newReliefDesc": "Urgent support needed for flood victims in Porto Alegre.",
        "donateNow": "Donate Now",
        "dashboardTitle": "Donor Impact Dashboard",
        "dashboardSubtitle": "Real-time update on your humanitarian contributions.",
        "verifiedBadge": "Verified Philanthropist",
        "totalDonated": "Total Donated",
        "fromLastMonth": "+5.2% from last month",
        "timelineTitle": "Project Timeline",
        "activeNow": "Active Now",
        "foodDistributionTitle": "Food Supply Distribution",
        "foodDistributionDesc": "Your donation of $500 is currently being used to distribute over 200 meal kits to displaced families in Porto Alegre, Brazil."
      },
      "accountSecurity": {
        "cardChangePasswordTitle": "Change Password",
        "cardChangePasswordSubtitle": "Use a long, unique password with at least 8 characters.",
        "cardRecoveryTitle": "Recovery Email",
        "cardRecoverySubtitle": "A second email address that also receives reset links and account security alerts.",
        "cardResetTitle": "Reset Password via Email",
        "cardResetSubtitle": "Forgot your password or suspect unauthorized access? We'll send a secure link to create a new one.",
        "currentPassword": "Current Password",
        "newPassword": "New Password",
        "confirmNewPassword": "Confirm New Password",
        "currentPasswordPlaceholder": "••••••••",
        "newPasswordPlaceholder": "Min. 8 characters",
        "confirmPasswordPlaceholder": "Repeat new password",
        "btnChangePassword": "Change Password",
        "btnSaving": "Saving...",
        "btnRemove": "Remove",
        "btnSaveEmail": "Save Email",
        "btnUpdateEmail": "Update Email",
        "accountEmailLabel": "Account Email",
        "recoveryEmailLabel": "Recovery Email",
        "newRecoveryEmailLabel": "New Recovery Email",
        "notRegistered": "Not registered",
        "recoveryEmailHint": "Must be different from your account email.",
        "confirmPasswordHint": "Enter current password to confirm.",
        "sendResetLink": "Send Reset Link",
        "sendingResetLink": "Sending Link...",
        "resetInfoText": "The link (valid for 60 minutes, single use) will be sent to",
        "strengthWeak": "Weak",
        "strengthFair": "Fair",
        "strengthGood": "Good",
        "strengthStrong": "Strong",
        "msgWrongPassword": "The current password is incorrect.",
        "msgWeakPassword": "The new password must be between 8 and 128 characters.",
        "msgSamePassword": "The new password must be different from the current one.",
        "msgInvalidEmail": "Please enter a valid email address.",
        "msgSameAsPrimary": "The recovery email must be different from the account email.",
        "msgRateLimited": "Too many attempts. Please wait a few minutes and try again.",
        "msgUnauthorized": "Your session has expired. Please sign in again.",
        "msgMissingFields": "Please fill in all required fields.",
        "msgMismatch": "Confirmation does not match the new password.",
        "msgChangeSuccess": "Password changed successfully. A security notice was sent to your email.",
        "msgRecoverySaved": "Recovery email saved successfully.",
        "msgRecoveryRemoved": "Recovery email removed.",
        "msgResetSent": "Reset link sent! It is valid for 60 minutes and can only be used once."
      },
      "admin": {
        "title": "Admin Console",
        "subtitle": "Manage humanitarian projects, initiatives, and pledges",
        "tabMissions": "Missions & Projects",
        "tabInitiatives": "Solidarity Initiatives",
        "tabPledges": "Pledges & Donations",
        "tabAccount": "Account Security",
        "createMission": "Create New Mission",
        "createInitiative": "Create New Initiative",
        "myMissions": "My Missions",
        "myInitiatives": "My Initiatives",
        "tablePledgesTitle": "Received Pledges & Donations",
        "tablePledgesSubtitle": "Real-time records of contributions made via Stripe and Mercado Pago",
        "colDonor": "Donor / Supporter",
        "colAmount": "Amount",
        "colGateway": "Gateway / Payment",
        "colTarget": "Target Project / Initiative",
        "colDate": "Date",
        "colStatus": "Status",
        "statusConfirmed": "Confirmed",
        "statusPending": "Pending",
        "deleteConfirmTitle": "Confirm Deletion",
        "deleteConfirmDesc": "Are you sure you want to delete '{{name}}'? This action cannot be undone.",
        "btnDelete": "Delete",
        "btnCancel": "Cancel",
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
      "contact": {
        "title": "Contact Us",
        "subtitle": "Have questions about our projects or how you can help? We'd love to hear from you.",
        "nameLabel": "Name",
        "namePlaceholder": "Your Name",
        "emailLabel": "Email",
        "emailPlaceholder": "your@email.com",
        "subjectLabel": "Subject",
        "subjectPlaceholder": "How can we help?",
        "messageLabel": "Message",
        "messagePlaceholder": "Your message here...",
        "submitBtn": "Send Message",
        "successTitle": "Message Sent!",
        "successDesc": "Thank you for reaching out. Our team will get back to you as soon as possible.",
        "sendAnother": "Send Another Message"
      },
      "privacy": {
        "title": "Privacy Policy",
        "p1": "Your privacy is important to us. This Privacy Policy explains how Building Bridges collects, uses, and protects your personal information when you use our website and services.",
        "h1": "1. Information We Collect",
        "p2": "We collect information you provide directly to us, such as when you make a donation, sign up for our newsletter, or contact us for support.",
        "h2": "2. How We Use Your Information",
        "p3": "We use the information we collect to process donations, provide transparency reports, and communicate with you about our impact and projects.",
        "h3": "3. Data Security",
        "p4": "We implement a variety of security measures to maintain the safety of your personal information. All sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology."
      },
      "terms": {
        "title": "Terms of Service",
        "p1": "By using the Building Bridges website, you agree to comply with and be bound by the following terms and conditions of use.",
        "h1": "1. Acceptance of Terms",
        "p2": "The services that Building Bridges provides to you are subject to the following Terms of Use. Building Bridges reserves the right to update the Terms of Use at any time without notice to you.",
        "h2": "2. Use of Services",
        "p3": "You agree to use the services only for purposes that are permitted by these Terms of Use and any applicable law, regulation, or generally accepted practices or guidelines in the relevant jurisdictions.",
        "h3": "3. Donations",
        "p4": "All donations made through our platform are final and non-refundable, except in cases of unauthorized use of your credit card or other payment methods."
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
        "resetSuccess": "Password reset email sent! Check your inbox.",
        "recoveryHint": "Use your account e-mail or your recovery e-mail.",
        "resetTitle": "New password",
        "resetSubtitle": "Choose a new password for your account",
        "resetNewPassword": "New password",
        "resetConfirmPassword": "Confirm new password",
        "minChars8": "At least 8 characters",
        "resetSubmit": "Save new password",
        "resetSaving": "Saving...",
        "resetDoneTitle": "Password updated",
        "resetDone": "Your password was changed. You can sign in now.",
        "resetInvalidLink": "This link is invalid or has expired.",
        "resetRequestNew": "Request a new link",
        "resetWeakPassword": "The password must have between 8 and 128 characters.",
        "resetMismatch": "The confirmation does not match the new password.",
        "resetRateLimited": "Too many attempts. Please wait a few minutes and try again.",
        "resetFailed": "Could not update the password. Please try again."
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Touching Nations, Changing Lives",
          "description": "Humanitarian disaster relief and support for families in need, disaster-stricken cities, and vulnerable individuals in Brazil and the USA."
        },
        "projects": {
          "title": "Humanitarian Projects | Building Bridges",
          "description": "Explore our active and completed humanitarian projects. Your donation provides transparent disaster relief in real-time."
        },
        "initiatives": {
          "title": "Action Hub & Urgent Projects | Building Bridges",
          "description": "Find out where we are acting right now. Urgent humanitarian response campaigns in Brazil and the United States."
        },
        "privacy": {
          "title": "Privacy Policy | Building Bridges",
          "description": "How Building Bridges collects, uses and protects your personal information when you donate or use our website."
        },
        "terms": {
          "title": "Terms of Service | Building Bridges",
          "description": "The terms and conditions that apply to the use of the Building Bridges website and donation services."
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
        "admin": "Painel Admin",
        "menu": "Menu",
        "close": "Fechar",
        "currency": "Moeda",
        "signOut": "Sair",
        "staffAccess": "Acesso Equipe"
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
        "contact": "Fale Conosco",
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
        "impactZones": "Zonas de Impacto",
        "updates": "Atualizações",
        "raisedOf": "arrecadados de",
        "goal": "Meta",
        "supportTitle": "Apoiar Esta Missão",
        "supportDesc": "Selecione o nível de contribuição para fornecer ajuda imediata.",
        "customAmount": "Valor Personalizado",
        "tierBasic": "Apoio Básico",
        "tierEssential": "Apoio Essencial",
        "tierExpanded": "Apoio Ampliado",
        "contactStep": "Informações de Contato",
        "contactDesc": "Informe seus dados para receber comprovante instantâneo e relatórios de impacto.",
        "name": "Nome Completo",
        "email": "Endereço de E-mail",
        "phone": "Telefone / WhatsApp",
        "notes": "Observações ou Mensagem",
        "proceedCheckout": "Avançar para Pagamento Seguro",
        "processing": "Processando...",
        "verifiedTitle": "Contribuição Confirmada!",
        "verifiedDesc": "Muito obrigado pela sua generosidade. Sua contribuição está sendo destinada diretamente para a resposta humanitária.",
        "receiptButton": "Ver Comprovante Oficial",
        "failTitle": "Falha na Validação"
      },
      "initiatives": {
        "badge": "Hub de Ação Coletiva",
        "title": "Apoie com uma",
        "titleHighlight": "Iniciativa Solidária",
        "subtitle": "Nossa rede de voluntários cria produtos físicos e atividades incríveis para financiar os projetos. Ao participar ou adquirir, 100% da arrecadação líquida vai direto para saneamento, alimentação e abrigos no campo.",
        "filterAll": "Todos",
        "filterItems": "Símbolos de Apoio (Itens)",
        "filterExperiences": "Atividades Coletivas (Experiências)",
        "tagItem": "Símbolo de Apoio",
        "tagExperience": "Atividade Coletiva",
        "tagProject": "Projeto",
        "generalProject": "Fundo Geral",
        "suggestedContribution": "Contribuição Sugerida",
        "btnAcquire": "Adquirir e Apoiar",
        "btnRegister": "Fazer Inscrição Solidária",
        "notFound": "Nenhuma iniciativa encontrada para esta categoria.",
        "validationLoading": "Validando o seu pagamento com o gateway seguro de apoio...",
        "validationFailedTitle": "Falha na Validação",
        "closeModal": "Fechar"
      },
      "checkout": {
        "title": "Complete sua Doação",
        "subtitle": "Sua contribuição fornece ajuda imediata para áreas atingidas por desastres.",
        "breadcrumb": "Doe Agora",
        "portalTitle": "Portal de Apoio Solidário",
        "portalSubtitle": "Sua contribuição direta chega integralmente às famílias necessitadas.",
        "step1": "Destino e Moeda",
        "step2": "Valor da Contribuição",
        "step3": "Informações de Contato",
        "projectLabel": "Projeto Humanitário",
        "currencyLabel": "Moeda e Gateway de Pagamento",
        "focusLabel": "Foco:",
        "tierBasic": "Apoio Básico",
        "tierEssential": "Apoio Essencial",
        "tierExpanded": "Apoio Ampliado",
        "customTier": "Outro Valor",
        "customPlaceholder": "Valor personalizado",
        "namePlaceholder": "Seu nome completo",
        "emailPlaceholder": "seu@email.com",
        "phonePlaceholder": "(11) 99999-9999",
        "notesPlaceholder": "Mensagem opcional para a equipe de campo...",
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
        "impactDesc": "Com base na sua seleção, esta doação fornecerá aproximadamente {{meals}} refeições nutritivas ou {{kits}} kits de emergência para famílias afetadas.",
        "impactShort": "Com este valor voluntário, forneceremos aproximadamente {{meals}} refeições quentes para famílias afetadas."
      },
      "dashboard": {
        "navTitle": "Navegação",
        "overview": "Visão Geral",
        "taxReceipts": "Comprovantes Fiscais",
        "impactReports": "Relatórios de Impacto",
        "newReliefTitle": "Novo Projeto de Socorro",
        "newReliefDesc": "Apoio urgente necessário para vítimas de enchentes em Porto Alegre.",
        "donateNow": "Doe Agora",
        "dashboardTitle": "Painel de Impacto do Doador",
        "dashboardSubtitle": "Atualizações em tempo real sobre suas contribuições humanitárias.",
        "verifiedBadge": "Filantropo Verificado",
        "totalDonated": "Total Doado",
        "fromLastMonth": "+5,2% em relação ao mês anterior",
        "timelineTitle": "Linha do Tempo dos Projetos",
        "activeNow": "Ativo Agora",
        "foodDistributionTitle": "Distribuição de Alimentos",
        "foodDistributionDesc": "Sua doação de R$ 500 está sendo usada para distribuir mais de 200 kits de refeições para famílias desabrigadas em Porto Alegre, Brasil."
      },
      "accountSecurity": {
        "cardChangePasswordTitle": "Alterar senha",
        "cardChangePasswordSubtitle": "Use uma senha longa e exclusiva, com pelo menos 8 caracteres.",
        "cardRecoveryTitle": "E-mail de recuperação",
        "cardRecoverySubtitle": "Um segundo endereço que também recebe o link de redefinição e os avisos de segurança da sua conta.",
        "cardResetTitle": "Recuperar senha por e-mail",
        "cardResetSubtitle": "Esqueceu a senha ou suspeita que alguém a descobriu? Enviamos um link seguro para criar uma nova.",
        "currentPassword": "Senha atual",
        "newPassword": "Nova senha",
        "confirmNewPassword": "Confirmar nova senha",
        "currentPasswordPlaceholder": "••••••••",
        "newPasswordPlaceholder": "Mínimo de 8 caracteres",
        "confirmPasswordPlaceholder": "Repita a nova senha",
        "btnChangePassword": "Alterar senha",
        "btnSaving": "Salvando...",
        "btnRemove": "Remover",
        "btnSaveEmail": "Salvar e-mail",
        "btnUpdateEmail": "Atualizar e-mail",
        "accountEmailLabel": "E-mail da conta",
        "recoveryEmailLabel": "E-mail de recuperação",
        "newRecoveryEmailLabel": "Novo e-mail de recuperação",
        "notRegistered": "Não cadastrado",
        "recoveryEmailHint": "Precisa ser diferente do e-mail da conta.",
        "confirmPasswordHint": "Digite sua senha atual para confirmar.",
        "sendResetLink": "Enviar link de redefinição",
        "sendingResetLink": "Enviando...",
        "resetInfoText": "O link (válido por 60 minutos, uso único) será enviado para",
        "strengthWeak": "Fraca",
        "strengthFair": "Razoável",
        "strengthGood": "Boa",
        "strengthStrong": "Forte",
        "msgWrongPassword": "A senha atual está incorreta.",
        "msgWeakPassword": "A nova senha deve ter entre 8 e 128 caracteres.",
        "msgSamePassword": "A nova senha deve ser diferente da atual.",
        "msgInvalidEmail": "Informe um e-mail válido.",
        "msgSameAsPrimary": "O e-mail de recuperação deve ser diferente do e-mail da conta.",
        "msgRateLimited": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        "msgUnauthorized": "Sua sessão expirou. Entre novamente.",
        "msgMissingFields": "Preencha todos os campos.",
        "msgMismatch": "A confirmação não é igual à nova senha.",
        "msgChangeSuccess": "Senha alterada com sucesso. Enviamos um aviso para o seu e-mail.",
        "msgRecoverySaved": "E-mail de recuperação salvo com sucesso.",
        "msgRecoveryRemoved": "E-mail de recuperação removido.",
        "msgResetSent": "Link enviado. Ele vale por 60 minutos e só pode ser usado uma vez."
      },
      "admin": {
        "title": "Painel de Controle Administrador",
        "subtitle": "Gerenciar projetos humanitários, iniciativas e doações",
        "tabMissions": "Missões e Projetos",
        "tabInitiatives": "Iniciativas Solidárias",
        "tabPledges": "Apoios & Doações",
        "tabAccount": "Segurança da Conta",
        "createMission": "Criar Nova Missão",
        "createInitiative": "Criar Nova Iniciativa",
        "myMissions": "Minhas Missões",
        "myInitiatives": "Minhas Iniciativas",
        "tablePledgesTitle": "Doações & Registros Recebidos",
        "tablePledgesSubtitle": "Histórico em tempo real de contribuições realizadas via Stripe e Mercado Pago",
        "colDonor": "Doador / Apoiador",
        "colAmount": "Valor",
        "colGateway": "Gateway / Pagamento",
        "colTarget": "Projeto / Iniciativa Alvo",
        "colDate": "Data",
        "colStatus": "Status",
        "statusConfirmed": "Confirmado",
        "statusPending": "Pendente",
        "deleteConfirmTitle": "Confirmar Exclusão",
        "deleteConfirmDesc": "Tem certeza que deseja excluir '{{name}}'? Esta ação não poderá ser desfeita.",
        "btnDelete": "Excluir",
        "btnCancel": "Cancelar",
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
      "contact": {
        "title": "Fale Conosco",
        "subtitle": "Tem dúvidas sobre nossos projetos ou como pode ajudar? Adoraríamos ouvir você.",
        "nameLabel": "Nome",
        "namePlaceholder": "Seu Nome",
        "emailLabel": "E-mail",
        "emailPlaceholder": "seu@email.com",
        "subjectLabel": "Assunto",
        "subjectPlaceholder": "Como podemos ajudar?",
        "messageLabel": "Mensagem",
        "messagePlaceholder": "Sua mensagem aqui...",
        "submitBtn": "Enviar Mensagem",
        "successTitle": "Mensagem Enviada!",
        "successDesc": "Obrigado pelo contato. Nossa equipe responderá o mais breve possível.",
        "sendAnother": "Enviar Outra Mensagem"
      },
      "privacy": {
        "title": "Política de Privacidade",
        "p1": "Sua privacidade é muito importante para nós. Esta Política de Privacidade explica como a Building Bridges coleta, usa e protege suas informações pessoais ao utilizar nosso site e serviços.",
        "h1": "1. Informações que Coletamos",
        "p2": "Coletamos informações fornecidas diretamente por você, como ao realizar uma doação, assinar nossa newsletter ou entrar em contato para suporte.",
        "h2": "2. Como Usamos Suas Informações",
        "p3": "Utilizamos os dados coletados para processar doações, fornecer relatórios de transparência e nos comunicar sobre nossos projetos e impacto.",
        "h3": "3. Segurança dos Dados",
        "p4": "Implementamos diversas medidas de segurança para manter a proteção de suas informações pessoais. Todos os dados sensíveis são transmitidos via tecnologia SSL criptografada."
      },
      "terms": {
        "title": "Termos de Serviço",
        "p1": "Ao utilizar o site da Building Bridges, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.",
        "h1": "1. Aceitação dos Termos",
        "p2": "Os serviços fornecidos pela Building Bridges estão sujeitos aos seguintes Termos de Uso. A Building Bridges reserva-se o direito de atualizar os Termos a qualquer momento sem aviso prévio.",
        "h2": "2. Uso dos Serviços",
        "p3": "Você concorda em utilizar os serviços apenas para fins permitidos por estes Termos de Uso e por qualquer lei, regulamento ou prática aceita nas jurisdições relevantes.",
        "h3": "3. Doações",
        "p4": "Todas as doações feitas através de nossa plataforma são definitivas e não reembolsáveis, exceto em casos de uso não autorizado do seu cartão de crédito ou método de pagamento."
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
        "resetSuccess": "E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.",
        "recoveryHint": "Use o e-mail da sua conta ou o seu e-mail de recuperação.",
        "resetTitle": "Nova senha",
        "resetSubtitle": "Escolha uma nova senha para a sua conta",
        "resetNewPassword": "Nova senha",
        "resetConfirmPassword": "Confirmar nova senha",
        "minChars8": "Mínimo de 8 caracteres",
        "resetSubmit": "Salvar nova senha",
        "resetSaving": "Salvando...",
        "resetDoneTitle": "Senha atualizada",
        "resetDone": "Sua senha foi alterada. Você já pode entrar.",
        "resetInvalidLink": "Este link é inválido ou expirou.",
        "resetRequestNew": "Solicitar um novo link",
        "resetWeakPassword": "A senha deve ter entre 8 e 128 caracteres.",
        "resetMismatch": "A confirmação não é igual à nova senha.",
        "resetRateLimited": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        "resetFailed": "Não foi possível atualizar a senha. Tente novamente."
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Alcançando Nações, Tocando Vidas",
          "description": "Ajuda humanitária em desastres e apoio a famílias em necessidade, cidades atingidas e pessoas vulneráveis no Brasil e nos EUA."
        },
        "projects": {
          "title": "Projetos Humanitários | Building Bridges",
          "description": "Explore nossos projetos humanitários ativos e concluídos. Sua doação apoia a reconstrução de cidades e o alívio transparente de desastres."
        },
        "initiatives": {
          "title": "Hub de Ação e Projetos Urgentes | Building Bridges",
          "description": "Descubra nossas respostas ativas a crises humanitárias e desastres naturais no Brasil e nos Estados Unidos. Faça a diferença."
        },
        "privacy": {
          "title": "Política de Privacidade | Building Bridges",
          "description": "Como a Building Bridges coleta, usa e protege suas informações pessoais quando você doa ou usa nosso site."
        },
        "terms": {
          "title": "Termos de Serviço | Building Bridges",
          "description": "Os termos e condições que se aplicam ao uso do site e dos serviços de doação da Building Bridges."
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
        "admin": "Panel Admin",
        "menu": "Menú",
        "close": "Cerrar",
        "currency": "Moneda",
        "signOut": "Cerrar sesión",
        "staffAccess": "Acceso Staff"
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
        "active": "Respuesta Activa",
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
        "contact": "Contáctenos",
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
        "impactZones": "Zonas de Impacto",
        "updates": "Actualizaciones",
        "raisedOf": "recaudados de",
        "goal": "Meta",
        "supportTitle": "Apoyar Esta Misión",
        "supportDesc": "Seleccione el nivel de contribución para proporcionar alivio inmediato.",
        "customAmount": "Monto Personalizado",
        "tierBasic": "Apoyo Básico",
        "tierEssential": "Apoyo Esencial",
        "tierExpanded": "Apoyo Ampliado",
        "contactStep": "Información de Contacto",
        "contactDesc": "Ingrese sus datos para recibir un recibo instantáneo e informes de impacto.",
        "name": "Nombre Completo",
        "email": "Correo Electrónico",
        "phone": "Teléfono / WhatsApp",
        "notes": "Notas Adicionales o Mensaje",
        "proceedCheckout": "Continuar al Pago Seguro",
        "processing": "Procesando...",
        "verifiedTitle": "¡Contribución Confirmada!",
        "verifiedDesc": "Muchas gracias por su generosidad. Su contribución se destina directamente a la respuesta humanitaria.",
        "receiptButton": "Ver Comprobante Oficial",
        "failTitle": "Fallo en la Validación"
      },
      "initiatives": {
        "badge": "Hub de Acción Colectiva",
        "title": "Apoye con una",
        "titleHighlight": "Iniciativa Solidaria",
        "subtitle": "Nuestra red de voluntarios crea productos físicos y actividades increíbles para financiar nuestros proyectos. Al participar o adquirir, el 100% de la recaudación neta va directo a saneamiento, alimentos y refugios en el campo.",
        "filterAll": "Todos",
        "filterItems": "Símbolos de Apoyo (Artículos)",
        "filterExperiences": "Actividades Colectivas (Experiencias)",
        "tagItem": "Símbolo de Apoyo",
        "tagExperience": "Actividad Colectiva",
        "tagProject": "Proyecto",
        "generalProject": "Fondo General",
        "suggestedContribution": "Contribución Sugerida",
        "btnAcquire": "Adquirir y Apoyar",
        "btnRegister": "Registro Solidario",
        "notFound": "No se encontraron iniciativas para esta categoría.",
        "validationLoading": "Validando su pago con la pasarela segura...",
        "validationFailedTitle": "Fallo en la Validación",
        "closeModal": "Cerrar"
      },
      "checkout": {
        "title": "Complete su Donación",
        "subtitle": "Su contribución proporciona alivio inmediato a las zonas afectadas por desastres.",
        "breadcrumb": "Dona Ahora",
        "portalTitle": "Portal de Apoyo Solidario",
        "portalSubtitle": "Su contribución directa llega íntegramente a las familias necesitadas.",
        "step1": "Destino y Moneda",
        "step2": "Monto de la Contribución",
        "step3": "Información de Contacto",
        "projectLabel": "Proyecto Humanitario",
        "currencyLabel": "Moneda y Pasarela de Pago",
        "focusLabel": "Enfoque:",
        "tierBasic": "Apoyo Básico",
        "tierEssential": "Apoyo Esencial",
        "tierExpanded": "Apoyo Ampliado",
        "customTier": "Otro Monto",
        "customPlaceholder": "Monto personalizado",
        "namePlaceholder": "Su nombre completo",
        "emailPlaceholder": "su@correo.com",
        "phonePlaceholder": "(11) 99999-9999",
        "notesPlaceholder": "Mensaje opcional para el equipo de campo...",
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
        "impactDesc": "Según su selección, esta donación proporcionará aproximadamente {{meals}} comidas nutritivas o {{kits}} kits de emergencia a familias afectadas.",
        "impactShort": "Con esta contribución voluntaria, proporcionaremos aproximadamente {{meals}} comidas calientes a familias afectadas."
      },
      "dashboard": {
        "navTitle": "Navegación",
        "overview": "Visión General",
        "taxReceipts": "Comprobantes Fiscales",
        "impactReports": "Informes de Impacto",
        "newReliefTitle": "Nuevo Proyecto de Socorro",
        "newReliefDesc": "Apoyo urgente necesario para víctimas de inundaciones en Porto Alegre.",
        "donateNow": "Dona Ahora",
        "dashboardTitle": "Panel de Impacto del Donante",
        "dashboardSubtitle": "Actualizaciones en tiempo real sobre sus contribuciones humanitarias.",
        "verifiedBadge": "Filántropo Verificado",
        "totalDonated": "Total Donado",
        "fromLastMonth": "+5.2% respecto al mes anterior",
        "timelineTitle": "Línea de Tiempo de Proyectos",
        "activeNow": "Activo Ahora",
        "foodDistributionTitle": "Distribución de Alimentos",
        "foodDistributionDesc": "Su donación de $500 se está utilizando para distribuir más de 200 kits de alimentos a familias desplazadas en Porto Alegre, Brasil."
      },
      "accountSecurity": {
        "cardChangePasswordTitle": "Cambiar contraseña",
        "cardChangePasswordSubtitle": "Use una contraseña larga y única, de al menos 8 caracteres.",
        "cardRecoveryTitle": "Correo de recuperación",
        "cardRecoverySubtitle": "Una segunda dirección que también recibe enlaces de restablecimiento y alertas de seguridad de la cuenta.",
        "cardResetTitle": "Restablecer contraseña por correo",
        "cardResetSubtitle": "¿Olvidó su contraseña o sospecha de un acceso no autorizado? Enviamos un enlace seguro para crear una nueva.",
        "currentPassword": "Contraseña actual",
        "newPassword": "Nueva contraseña",
        "confirmNewPassword": "Confirmar nueva contraseña",
        "currentPasswordPlaceholder": "••••••••",
        "newPasswordPlaceholder": "Mín. 8 caracteres",
        "confirmPasswordPlaceholder": "Repita la nueva contraseña",
        "btnChangePassword": "Cambiar contraseña",
        "btnSaving": "Guardando...",
        "btnRemove": "Eliminar",
        "btnSaveEmail": "Guardar correo",
        "btnUpdateEmail": "Actualizar correo",
        "accountEmailLabel": "Correo de la cuenta",
        "recoveryEmailLabel": "Correo de recuperación",
        "newRecoveryEmailLabel": "Nuevo correo de recuperación",
        "notRegistered": "No registrado",
        "recoveryEmailHint": "Debe ser diferente al correo de la cuenta.",
        "confirmPasswordHint": "Ingrese su contraseña actual para confirmar.",
        "sendResetLink": "Enviar enlace de restablecimiento",
        "sendingResetLink": "Enviando...",
        "resetInfoText": "El enlace (válido por 60 minutos, uso único) será enviado a",
        "strengthWeak": "Débil",
        "strengthFair": "Aceptable",
        "strengthGood": "Buena",
        "strengthStrong": "Fuerte",
        "msgWrongPassword": "La contraseña actual es incorrecta.",
        "msgWeakPassword": "La nueva contraseña debe tener entre 8 y 128 caracteres.",
        "msgSamePassword": "La nueva contraseña debe ser diferente de la actual.",
        "msgInvalidEmail": "Ingrese un correo electrónico válido.",
        "msgSameAsPrimary": "El correo de recuperación debe ser diferente del correo de la cuenta.",
        "msgRateLimited": "Demasiados intentos. Espere unos minutos e intente de nuevo.",
        "msgUnauthorized": "Su sesión ha expirado. Inicie sesión de nuevo.",
        "msgMissingFields": "Complete todos los campos requeridos.",
        "msgMismatch": "La me confirmación no coincide con la nueva contraseña.",
        "msgChangeSuccess": "Contraseña cambiada con éxito. Se envió un aviso de seguridad a su correo.",
        "msgRecoverySaved": "Correo de recuperación guardado con éxito.",
        "msgRecoveryRemoved": "Correo de recuperación eliminado.",
        "msgResetSent": "¡Enlace enviado! Es válido por 60 minutos y solo se puede usar una vez."
      },
      "admin": {
        "title": "Consola de Administrador",
        "subtitle": "Gestionar proyectos humanitarios, iniciativas y donaciones",
        "tabMissions": "Misiones y Proyectos",
        "tabInitiatives": "Iniciativas Solidarias",
        "tabPledges": "Donaciones & Registros",
        "tabAccount": "Seguridad de la Cuenta",
        "createMission": "Crear Nueva Misión",
        "createInitiative": "Crear Nueva Iniciativa",
        "myMissions": "Mis Misiones",
        "myInitiatives": "Mis Iniciativas",
        "tablePledgesTitle": "Donaciones & Registros Recibidos",
        "tablePledgesSubtitle": "Historial en tiempo real de contribuciones realizadas vía Stripe y Mercado Pago",
        "colDonor": "Donante / Simpatizante",
        "colAmount": "Monto",
        "colGateway": "Pasarela / Pago",
        "colTarget": "Proyecto / Iniciativa Objetivo",
        "colDate": "Fecha",
        "colStatus": "Estado",
        "statusConfirmed": "Confirmado",
        "statusPending": "Pendiente",
        "deleteConfirmTitle": "Confirmar Eliminación",
        "deleteConfirmDesc": "¿Está seguro de que desea eliminar '{{name}}'? Esta acción no se puede deshacer.",
        "btnDelete": "Eliminar",
        "btnCancel": "Cancelar",
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
      "contact": {
        "title": "Contáctenos",
        "subtitle": "¿Tiene preguntas sobre nuestros proyectos o cómo puede ayudar? Nos encantaría saber de usted.",
        "nameLabel": "Nombre",
        "namePlaceholder": "Su Nombre",
        "emailLabel": "Correo Electrónico",
        "emailPlaceholder": "su@correo.com",
        "subjectLabel": "Asunto",
        "subjectPlaceholder": "¿Cómo podemos ayudar?",
        "messageLabel": "Mensaje",
        "messagePlaceholder": "Su mensaje aquí...",
        "submitBtn": "Enviar Mensaje",
        "successTitle": "¡Mensaje Enviado!",
        "successDesc": "Gracias por ponerse en contacto. Nuestro equipo le responderá lo antes posible.",
        "sendAnother": "Enviar Otro Mensaje"
      },
      "privacy": {
        "title": "Política de Privacidad",
        "p1": "Su privacidad es importante para nosotros. Esta Política de Privacidad explica cómo Building Bridges recopila, usa y protege su información personal cuando utiliza nuestro sitio web y servicios.",
        "h1": "1. Información que Recopilamos",
        "p2": "Recopilamos la información que nos proporciona directamente, como cuando realiza una donación, se suscribe a nuestro boletín o nos contacta para obtener soporte.",
        "h2": "2. Cómo Usamos su Información",
        "p3": "Usamos la información que recopilamos para procesar donaciones, proporcionar informes de transparencia y comunicarnos con usted sobre nuestros proyectos e impacto.",
        "h3": "3. Seguridad de Datos",
        "p4": "Implementamos una variedad de medidas de seguridad para mantener la seguridad de su información personal. Toda la información confidencial se transmite a través de tecnología SSL encriptada."
      },
      "terms": {
        "title": "Términos de Servicio",
        "p1": "Al utilizar el sitio web de Building Bridges, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso.",
        "h1": "1. Aceptación de Términos",
        "p2": "Los servicios que Building Bridges le proporciona están sujetos a los siguientes Términos de Uso. Building Bridges se reserva el derecho de actualizar los Términos en cualquier momento sin previo aviso.",
        "h2": "2. Uso de Servicios",
        "p3": "Usted acepta utilizar los servicios solo para los fines permitidos por estos Términos de Uso y cualquier ley, reglamento o práctica aceptada en las jurisdicciones relevantes.",
        "h3": "3. Donaciones",
        "p4": "Todas las donaciones realizadas a través de nuestra plataforma son definitivas y no reembolsables, excepto en casos de uso no autorizado de su tarjeta de crédito u otro método de pago."
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
        "resetSuccess": "¡Correo electrónico de restablecimiento enviado! Revise su bandeja de entrada.",
        "recoveryHint": "Use el correo de su cuenta o su correo de recuperación.",
        "resetTitle": "Nueva contraseña",
        "resetSubtitle": "Elija una nueva contraseña para su cuenta",
        "resetNewPassword": "Nueva contraseña",
        "resetConfirmPassword": "Confirmar nueva contraseña",
        "minChars8": "Mínimo 8 caracteres",
        "resetSubmit": "Guardar nueva contraseña",
        "resetSaving": "Guardando...",
        "resetDoneTitle": "Contraseña actualizada",
        "resetDone": "Su contraseña fue cambiada. Ya puede iniciar sesión.",
        "resetInvalidLink": "Este enlace no es válido o ya expiró.",
        "resetRequestNew": "Solicitar un nuevo enlace",
        "resetWeakPassword": "La contraseña debe tener entre 8 y 128 caracteres.",
        "resetMismatch": "La confirmación no coincide con la nueva contraseña.",
        "resetRateLimited": "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.",
        "resetFailed": "No se pudo actualizar la contraseña. Inténtelo de nuevo."
      },
      "seo": {
        "home": {
          "title": "Building Bridges | Alcanzando Naciones, Tocando Vidas",
          "description": "Ayuda humanitaria en desastres y apoyo a familias necesitadas, ciudades afectadas y personas vulnerables en Brasil y EE. UU."
        },
        "projects": {
          "title": "Proyectos Humanitarios | Building Bridges",
          "description": "Explore nuestros proyectos humanitarios activos y completados. Su donación apoya la reconstrucción de ciudades y el alivio transparente de desastres."
        },
        "initiatives": {
          "title": "Hub de Acción y Proyectos Urgentes | Building Bridges",
          "description": "Descubra nuestras respuestas activas a crisis humanitarias y desastres naturales en Brasil y Estados Unidos. Marque la diferencia hoy."
        },
        "privacy": {
          "title": "Política de Privacidad | Building Bridges",
          "description": "Cómo Building Bridges recopila, usa y protege su información personal cuando dona o usa nuestro sitio web."
        },
        "terms": {
          "title": "Términos de Servicio | Building Bridges",
          "description": "Los términos y condiciones que se aplican al uso del sitio web y de los servicios de donación de Building Bridges."
        },
        "contact": {
          "title": "Contáctenos | Building Bridges",
          "description": "Póngase en contacto con el equipo de coordinación humanitaria en Brasil y EE. UU. Juntos, construimos puentes de esperanza."
        }
      }
    }
  }
};

// Clean up legacy detector key from localStorage if previously set by browser detection
try {
  localStorage.removeItem('i18nextLng');
} catch {
  // ignore
}

// On first access or every fresh visit, the default language must ALWAYS be English ('en').
// If the user actively chose another language in the current session (via the widget) or passed ?lng=, respect it.
const getInitialLanguage = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramLng = params.get('lng') || params.get('lang');
      if (paramLng && ['en', 'pt', 'es'].includes(paramLng)) {
        return paramLng;
      }
      const sessionLng = sessionStorage.getItem('bb_lang');
      if (sessionLng && ['en', 'pt', 'es'].includes(sessionLng)) {
        return sessionLng;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  try {
    sessionStorage.setItem('bb_lang', lng);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
  } catch {
    // ignore
  }
});

export default i18n;
