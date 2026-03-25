## Documentation SignalR - API Tuuuur

(Ranked)
Cette documentation détaille les interactions temps réel disponibles via le Hub SignalR
RankedHub . Elle couvre les actions que l e client peut effectuer e t les évènements que l e
serveur envoie.

1. Actions Client → Serveur
   Ces méthodes sont invoquées par le client (application mobile/web) pour interagir avec le
   serveur.

**JoinSearchOpponent**

Rejoint la file de matchmaking. Le serveur recherche un adversaire avec un ELO
compatible.
• Méthode : JoinSearchOpponent
• Paramètres : Aucun
• Réponse : Quand un adversaire est trouvé, déclenche OnOpponentFound pour les deux
joueurs. En cas d'échec, déclenche OnError pour l'appelant.

**LeaveSearchOpponent**
Quitte la file de matchmaking avant d'avoir trouvé un adversaire.
• Méthode : LeaveSearchOpponent
• Paramètres : Aucun
• Réponse : Aucune notification envoyée. En cas d'échec, déclenche OnError pour
l'appelant.

**SendAnswer**
Envoie la réponse du joueur pour la question en cours.
• Méthode : SendAnswer
• Paramètres :
• P_AnswerId (integer) : L'identifiant unique de la réponse sélectionnée.
• Réponse : Déclenche AllUserAnswer pour l'adversaire (indicateur "a répondu")
En cas d'échec, déclenche OnError pour l'appelant.

2. Évènements Serveur → Client
   Ces méthodes sont définies dans l'interface IRankedClient e t sont appelées par l e
   serveur pour notifier les clients.

### Matchmaking

**OnOpponentFound**

Notifie qu'un adversaire a été trouvé. Chaque joueur reçoit l'objet User de son
adversaire.
• Cible : Joueur spécifique (Unicast).
• Payload (User) :
{
"id": "guid",
"nickName": "string",
"email": "string",
"avatar": "string or null",
"isAdmin": false,
"isNew": false,
"isGoogleUser": false,
"isInvitedUser": false,
"elo": [
{ "idTheme": 1,
"value": 1000,
"theme": null
}],
"globalE10": 1000
}

### Déroulement du Jeu (Gameplay)

**OnCountdown**
Envoie un décompte avant l'envoi d'une question (ex : 3, 2, 1).
• Cible : Les deux joueurs d e la partie.
• Payload: integer (Nombre d e secondes restantes).

**OnQuestionSend**
Envoie la question courante à afficher.
• Cible : Joueur spécifique (Unicast).
• Note : La propriété valid des réponses est masquée ( null ) à cette étape pour éviter la
triche.
• Payload (RankedQuestion) :
"question": {
"id": 1,
"label": "string"
"idDifficulty": 1 ,
"answer": [
{
"id": 10,
"idQuestion": 1 ,
"value": "string",
"valid": null
}]
"difficulty": {
"id": 1 ,
"label": "string"
}
"partyQuestion": []
"questionTheme":
[
{
"id": 1,
"idQuestion": 1 ,
"idTheme": 2,
"theme":
"id": 2,
"icon": "string",
"label": "string"
}
]
"currentIndex": 0,
"score": 0,
"multiplier": 1.0
}

**OnUserAnswer**

Notifie que l'adversaire a validé sa réponse (sans révéler laquelle). Permet d'afficher u n
indicateur "A répondu" dans l'UI.

• Cible l'autre joueur de la partie
• Payload (User) :
{
"id": "guid"
"nickName": "string",
"email": "string"
"avatar": "string or null",
"isAdmin": false,
"isNew": false,
"isGoogleUser": false,
"isInvitedUser": false,
"elo": I,
"globalElo": 0
}

**OnAllPlayerAnswered**
Notifie que les deux joueurs ont répondu (ou que le temps imparti est écoulé). Indique
pour chacun si sa réponse était correcte, sans encore révéler la bonne réponse.
• Cible : Les deux joueurs d e la partie.
• Payload (List<UserAnswered>) :
[{
"correct": true,
"user": {
"id": "guid",
"nickName": "string",
"email": "string",
"avatar": "string or null",
"isAdmin": false,
"isNew": false,
"isGoogleUser": false,
"isInvitedUser": false,
"elo": [],
"globalElo": 0
}
}]

**OnQuestionAnswerSend**

Envoie le résultat d e la question après que tous les joueurs ont répondu. Révèle la bonne
réponse (valid valorisé) e t le score obtenu.
• Cible : Joueur spécifique (Unicast).
• Payload (RankedQuestion) :

{
"question": {
"id": 1,
"label": "string",
"idDifficulty": 1,
"answer": [
"id": 10,
"idQuestion": 1,
"value": "string",
"valid": true
},
{
"id": 11,
"idQuestion": 1,
"value": "string",
"valid": false
}
],
"difficulty": {
"id": 1,
"label": "string"
},
"partyQuestion": [],
"questionTheme": [],
},
"currentIndex": 0,
"score": 850,
"multiplier": 1.0
}

**OnScoreUpdate**
Envoie le tableau des scores mis à jour après chaque question.
• Cible : Les deux joueurs de la partie.
• Payload (List<UserScore>) :
[{ "score": 850,
"user": {
"id": "guid",
"nickName": "string",
"email": "string",
"avatar": "string or null",
"isAdmin": false,
"isNew": false,
"isGoogleUser": false,
"isInvitedUser": false,
"elo": [],
"globalElo": 0
}
}
]

**OnPartyFinished**
Signale la fi n d e la partie et fournit le classement final définitif.
• Cible : Les deux joueurs de la partie.
• Payload (List<UserScore>) :

[{"score": 2400,
"user": {
"id": "guid"
"nickName": "string",
"email": "string",
"avatar": "string or null",
"¡sAdmin": false,
"isNew": false,
"isGoogleUser": false,
"isInvitedUser": false,
"elo": I,
"globalElo": 0
}
}
]

### Résultat ELO

**OnUserWin**

Signale que le joueur a gagné la partie et indique la variation d'ELO.
• Cible : Joueur spécifique (Unicast).
• Payload : integer (Nombre d e points ELO gagnés).

**OnUserLoose**
Signale que le joueur a perdu la partie et indique la variation d'ELO.
• Cible : Joueur spécifique (Unicast).
• Payload : integer (Nombre d e points ELO perdus).

### Gestion des Erreurs

**OnError**

Signale qu'une erreur est survenue lors du traitement d'une action client.
• Cible : L'appelant (Caller).
• Payload : string (Message d'erreur descriptif).
