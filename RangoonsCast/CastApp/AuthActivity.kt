import android.os.Bundle
import androidx.activity.ComponentActivity
import com.google.firebase.auth.FirebaseAuth

class AuthActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        auth = FirebaseAuth.getInstance()
    }

    fun loginWithPhoneNumber(phoneNumber: String) {
        auth.signInWithPhoneNumber(phoneNumber)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    // Redirect to MainActivity
                } else {
                    // Show error
                }
            }
    }
}
