package ca.mchacks.connectu;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;

public class ConnectU extends AppCompatActivity {

    private EditText Name;
    private EditText Password;
    private TextView Info;
    private Switch Login; //or connect. This refers to the switch connect button
    private int counter = 5;
    private TextView userRegistration;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_connect_u);

        Name = (EditText) findViewById(R.id.editTextName);
        Password = (EditText)findViewById(R.id.editTextPassword);
        Info = (TextView) findViewById(R.id.textviewInfo);
        Login = (Switch) findViewById(R.id.switchConnect);
        userRegistration = (TextView) findViewById(R.id.textViewRegister);

        Info.setText("No of items remaining is 5");

        Login.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton compoundButton, boolean isChecked) {
                if(isChecked) {
                    validate(Name.getText().toString(), Password.getText().toString());
                }
            }
        });

        userRegistration.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(ConnectU.this, RegistrationActivity.class));
            }
        });
    }

    private void validate(String userName, String userPassword){
        if(userName.equals("Koshi") && userPassword.equals("1234")){
            Intent intent = new Intent(ConnectU.this, Connections.class);
            startActivity(intent);
        } else{
            counter --;
            Info.setText("No of items remaining" + String.valueOf(counter));

            if(counter == 0) {
                Login.setChecked(false);
            }
        }
    }
}
