/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
    createExtension: function(_, gd) {
        const extension = new gd.PlatformExtension();

        extension
          .setExtensionInformation(
            'Firebase',
            _('Firebase'),
            _('Use google Firebase features in GDevelop'),
            'Arthur Pacaud (arthuro555)',
            'MIT'
          )
          .setExtensionHelpPath('/all-features/firebase');

		
		/* ====== ANALYTICS ====== */
		extension
          .addAction(
            'AnalyticsEnable',
            _('Enable analytics'),
            _(
              'Enables Analytics for that project.'
             ),
            _('Enable analytics'),
            _('Firebase/Analytics'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
          )
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_analyticstools.js')
		  .setFunctionName('firebase.analytics');

        extension
          .addAction(
            'AnalyticsLog',
            _('Log an Event'),
            _(
              'Triggers an Event/Conversion for the current user on the Analytics.' + 
              'Can also pass additional data to the Analytics'
             ),
            _('Trigger Event _PARAM1_ with argument _PARAM2_'),
            _('Firebase/Analytics'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('Event Name'), '', false)
          .addParameter('string', _('Additional Data'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_analyticstools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.log');

        extension
          .addAction(
            'AnalyticsSetUID',
            _('Change user UID'),
            _(
              'Changes the current user\'s analytics identifier. ' +
              'This is what let Analytics differienciate users, ' + 
              'so it should always be unique for each user. ' + 
              'Only mess with that if you know what you are doing!'
             ),
            _('Set current user\'s ID to _PARAM1_'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('New Unique ID'), '', false)
          .markAsComplex()
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_analyticstools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.setUserID');
        
        extension
          .addAction(
            'AnalyticsSetProperty',
            _('Set a user\'s property'),
            _(
              'Sets an user\'s properties.' + 
              'Can be used to classify users in Analytics.'
             ),
            _('Set property _PARAM1_ of the current user to _PARAM2_'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('Property Name'), '', false)
          .addParameter('string', _('Property Data'), '', false)
          .markAsAdvanced()
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_analyticstools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.setProperty');


		/* ====== REMOTE CONFIGURATION ====== */
        extension
          .addStrExpression(
            'GetRCString',
            _('Get Remote setting as String'),
            _('Get a setting from Firebase Remote Config as String.'),
            _('Firebase/Remote Config'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('string', _('Setting Name'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-remote-config.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_remoteconfigtools.js')
          .setFunctionName('firebase.remoteConfig().getString');

        extension
          .addExpression(
            'GetRCString',
            _('Get Remote setting as Number'),
            _('Get a setting from Firebase Remote Config as Number.'),
            _('Firebase/Remote Config'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('string', _('Setting Name'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-remote-config.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_remoteconfigtools.js')
          .setFunctionName('firebase.remoteConfig().getNumber');

        extension
          .addAction(
            'SetRCAutoUpdateInterval',
            _('Set Remote Config Auto Update Inteval'),
            _('Sets Remote Config Auto Update Inteval.'),
            _('Set Remote Config Auto Update Inteval to _PARAM0_'),
            _('Firebase/Remote Config'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('number', _('Update Interval in ms'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-remote-config.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_remoteconfigtools.js')
          .setFunctionName('gdjs.evtTools.firebase.RC.setAutoUpdateInterval');
        
        extension
          .addAction(
            'SetRCDefaultConfig',
            _('Set the default configuration'),
            _(
              'As the Remote Config is online, you need to set a default ' + 
              'for when there is no internet or the config still loading.'
            ),
            _('Set default config to _PARAM0_'),
            _('Firebase/Remote Config'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('scenevar', _('Structure with defaults'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-remote-config.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_remoteconfigtools.js')
          .setFunctionName('gdjs.evtTools.firebase.RC.setDefaultConfig');

        extension
          .addAction(
            'ForceReloadRC',
            _('Force sync the configuration'),
            _('Use this to sync the Remote Config with the client at any time.'),
            _('Synchronize Remote Config'),
            _('Firebase/Remote Config'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-remote-config.js')
          .setFunctionName('firebase.remoteConfig().fetchAndActivate');

		
		/* ====== AUTHENTIFICATION ====== */
		// Auth Instructions
        extension
          .addAction(
            'CreateBasicAccount',
            _('Create account with basic auth'),
            _('Create an account with e-mail and password as credentials.'),
            _('Create account with E-Mail _PARAM0_ and password _PARAM1_'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('string', _('E-Mail'), '', false)
		  .addParameter('string', _('Password'), '', false)
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
          .setFunctionName('gdjs.evtTools.firebase.auth.createAccountWithEmail');

        extension
          .addAction(
            'BasicAccountSignIn',
            _('Sign into an account with basic auth'),
			_(
			  'Sign into an account with e-mail and password as credentials. ' +
			  'The Authetification state variable will be set to "ok" if the authentification ' +
			  'is succcessful, else it will contain the error message.'
			),
            _('Connect to account with E-Mail _PARAM0_ and password _PARAM1_'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('string', _('E-Mail'), '', false)
		  .addParameter('string', _('Password'), '', false)
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
          .setFunctionName('gdjs.evtTools.firebase.auth.signInWithEmail');
		
		extension
          .addAction(
            'ProviderAccountSignIn',
            _('Sign into an account with auth from provider'),
			_(
			  'Sign into an account via an external provider. ' +
			  'The Authetification state variable will be set to "ok" if the authentification ' +
			  'is succcessful, else it will contain the error message. \n' +
			  'The availablke providers are: "google", "facebook", "github" and "twitter".\n' + 
			  'Provider Authentification only works in the browser.'
			),
            _('Connect to account with Provider _PARAM0_'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
          .setFunctionName('gdjs.evtTools.firebase.auth.signInWithProvider');

        extension
          .addAction(
            'AnonymSignIn',
            _('Sign In as an anonym guest'),
            _('Sign into a temporary anonymous account.'),
            _('Authenticate anonymously'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
          .setFunctionName('gdjs.evtTools.firebase.auth.anonymSignIn');

        extension
          .addCondition(
            'IsSignedIn',
            _('Is the user signed in?'),
			_(
			  'Checks if the user is signed in. \nYou should always use ' +
			  'this before actions requiring authentifications.'
			),
            _('Check for authentification'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.isAuthentified');
		  
		extension
		  .addStrExpression(
            'GetAuthToken',
            _('Get the users authentififcation token'),
            _('Get the users authentififcation token. The token is the proof of authentification.'),
            _('Firebase/Authentification'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
          .addParameter('string', _('Setting Name'), '', false)
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.token');

		//User management Instructions

		extension
          .addCondition(
            'IsEmailVerified',
            _('Is the users Email address verified'),
            _('Checks if the email address of the user got verified.'),
            _('The Email of the user is verified'),
            _('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.isEmailVerified');

		extension
		  .addStrExpression(
            'GetUserEmail',
            _('Get the users email address'),
            _('Gets the users email address.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getEmail');

		extension
		  .addStrExpression(
			'GetAccountCreationTime',
			_('Get the accounts creation time'),
			_('Gets the accounts creation time.'),
			_('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
     	  )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
      	  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getCreationTime');

		extension
		  .addStrExpression(
            'GetLastLoginTime',
            _('Get the users last login time'),
            _('Gets the users last login time.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
      	  )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getLastLoginTime');

		extension
		  .addStrExpression(
            'GetUserDisplayName',
            _('Get the users display name'),
            _('Gets the users display name.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getDisplayName');

		extension
		  .addStrExpression(
            'GetPhoneNumber',
            _('Get the users phone number'),
            _('Gets the users phone number.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getPhoneNumber');

		extension
		  .addStrExpression(
            'GetUserUID',
            _('Get the users ID'),
            _(
				'Gets the users Unique Identifier. Use that to link data to an ' +
				'user instead of the name or email.'
			),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
          )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
          .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getUID');

		extension
		  .addStrExpression(
            'GetTenantID',
            _('Get the users Tenant ID'),
            _('Gets the users Tenant ID. Only use that if you know what you are doing.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
      	  )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getTenantID');

		extension
		  .addStrExpression(
            'GetRefreshToken',
            _('Get the users refresh token'),
            _('Gets the users Refresh Token. Only use that if you know what you are doing.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
      	  )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getRefreshToken');

		extension
		  .addStrExpression(
            'GetPhotoURL',
            _('Get the users Profile Picture URL'),
            _('Gets an URL to the users profile picture.'),
            _('Firebase/Authentification/User Management'),
            'JsPlatform/Extensions/firebase.png',
            'JsPlatform/Extensions/firebase.png'
      	  )
		  .getCodeExtraInformation()
		  .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.getPhotoURL');

		extension
          .addAction(
            'SendEmailVerification',
            _('Send a verification Email'),
            _(
              'Send a link per email to verify the users email.'
             ),
            _('Send Verification Email'),
            _('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
          )
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.sendVerificationEmail');

		extension
          .addAction(
            'SetDisplayName',
            _('Set Display Name'),
            _(
              'Sets the users display name.'
             ),
            _('Set the user\'s display name to _PARAM0_'),
            _('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('New display name'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.setDisplayName');

		extension
          .addAction(
            'SetPhotoURL',
            _('Set the users profile picture'),
            _(
              'Sets the users profile picture URL to a new one.'
             ),
            _('Set the user\'s display name to _PARAM0_'),
            _('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('New photo\'s URL'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.setPhotoURL');

		extension
          .addAction(
            'SetPhotoURL',
            _('Set the users profile picture'),
            _(
              'Sets the users profile picture URL to a new one.'
             ),
            _('Set the user\'s display name to _PARAM0_'),
            _('Firebase/Authentification/User Management'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('New photo\'s URL'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.setPhotoURL');

		// Dangerous Authentification Instructions
		extension
          .addAction(
            'ChangeEmail',
            _('Change the users email'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Changes the user\'s email address.'
             ),
            _('Change the user\'s email to _PARAM0_ and store result in _PARAM4_ (Send verification email: _PARAM3_)'),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('Old Email'), '', false)
		  .addParameter('string', _('Password'), '', false)
		  .addParameter('string', _('New Email'), '', false)
		  .addParameter('yesorno', _('Send verification Email before change?'), '', false)
		  .setDefaultValue('true')
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.changeEmail');

		extension
          .addAction(
            'ChangeEmailProvider',
            _('Change the users email (Provider)'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Changes the user\'s email address.\n' +
			  'This is the same as Change the users email but reauthenticates via an external provider.'
             ),
            _('Change the user\'s email to _PARAM0_ and store result in _PARAM2_ (Send verification email: _PARAM1_)'),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('New Email'), '', false)
		  .addParameter('yesorno', _('Send verification Email before change?'), '', false)
		  .setDefaultValue('true')
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.changeEmailProvider');

		extension
          .addAction(
            'ChangePassword',
            _('Change the users password'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Changes the user\'s password.'
             ),
			_(
			  'Change the user\'s password to _PARAM2_ and store result in ' +
			  '_PARAM4_ (Send verification email: _PARAM3_)'
			),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('Email'), '', false)
		  .addParameter('string', _('Old Password'), '', false)
		  .addParameter('string', _('New Password'), '', false)
		  .addParameter('yesorno', _('Send verification Email before change?'), '', false)
		  .setDefaultValue('true')
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.changePassword');

		extension
          .addAction(
            'ChangePasswordProvider',
            _('Change the users password (Provider)'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Changes the user\'s password.\n' +
			  'This is the same as Change the users password but reauthenticates via an external provider.'
             ),
			_(
				'Change the user\'s password to _PARAM0_ and store result in ' +
				'_PARAM2_ (Send verification email: _PARAM1_)'
			),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('New Password'), '', false)
		  .addParameter('yesorno', _('Send verification Email before change?'), '', false)
		  .setDefaultValue('true')
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.changePasswordProvider');

		  extension
          .addAction(
            'DeleteUser',
            _('Delete the users account'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Deletes the users account.'
             ),
            _('Delete the users account and store result in _PARAM2_'),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('string', _('Email'), '', false)
		  .addParameter('string', _('Password'), '', false)
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.deleteUser');

		extension
          .addAction(
            'DeleteUserProvider',
            _('Delete the users account (Provider)'),
            _(
			  'This Action is dangerous so it requires reauthentification.\n' +
			  'Deletes the users account.\n' +
			  'This is the same as Delete the users account but reauthenticates via an external provider.'
             ),
            _('Delete the users account and store result in _PARAM0_'),
            _('Firebase/Authentification/User Management/Dangerous'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter('scenevar', _('Authentification State Variable'), '', false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-auth.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .addIncludeFile('Extensions/Firebase/firebasetools/D_authtools.js')
		  .setFunctionName('gdjs.evtTools.firebase.auth.userManagement.dangerous.deleteUserProvider');

		/* ====== PERFORMANCE ====== */

		extension
          .addAction(
            'EnablePerformance',
            _('Enable Performance Measuring'),
            _('Enables Performance Measuring.'),
            _('Enable Performance Measuring'),
            _('Firebase/Performance Measuring'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/firebasejs/B_firebase-performance.js')
      	  .addIncludeFile('Extensions/Firebase/firebasetools/C_firebasetools.js')
		  .setFunctionName('firebase.performance');

        return extension;
    },
    runExtensionSanityTests: function(gd, extension) {
        return [];
    },
}
