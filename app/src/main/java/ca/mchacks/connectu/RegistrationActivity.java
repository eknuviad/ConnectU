package ca.mchacks.connectu;

import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;

public class RegistrationActivity extends AppCompatActivity {

    private EditText userName, userPassword, userEmail ;
    private Button signupbutton;
    private TextView userLogin;
    private FirebaseAuth firebaseAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);
        setUpUIViews();

        firebaseAuth = FirebaseAuth.getInstance();

        signupbutton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                switch (view.getId()){
                    case R.id.btnRegister:
                       if(validate()){
                           //register to the database
                           String user_email = userEmail.getText().toString().trim();
                           String user_password = userPassword.getText().toString().trim();

                           firebaseAuth.createUserWithEmailAndPassword(user_email, user_password).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
                               @Override
                               public void onComplete(@NonNull Task<AuthResult> task) {
                                   if(task.isSuccessful()) {
                                       Toast.makeText(RegistrationActivity.this, "Sign Up successful", Toast.LENGTH_SHORT).show();
                                       startActivity(new Intent(RegistrationActivity.this,ConnectU.class));
                                   }else{
                                       Toast.makeText(RegistrationActivity.this, "Sign Up Failed", Toast.LENGTH_SHORT).show();
                                   }
                               }
                           });
                       } break;

                    default:
                        break;
                }

            }
        });

        userLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(RegistrationActivity.this, ConnectU.class));
            }
        });

    }
    private void setUpUIViews() {
        userName = (EditText) findViewById(R.id.editTextUsername);
        userPassword = (EditText)findViewById(R.id.editTextUserPassword);
        userEmail = (EditText) findViewById(R.id.editTextUserEmail);
        signupbutton = (Button) findViewById(R.id.btnRegister);
        userLogin = (TextView) findViewById(R.id.textViewUserLogin);

    }
    private Boolean validate(){
        Boolean result = false;

        String name = userName.getText().toString();
        String password = userPassword.getText().toString();
        String email = userEmail.getText().toString();

        if (name.isEmpty() || password.isEmpty() || email.isEmpty()){
            Toast.makeText(this, "All fields must be filled", Toast.LENGTH_SHORT).show();
        }else{
            result = true;
        }
        return result;
    }
}
