CREATE TABLE IF NOT EXISTS "pending_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nik" varchar(50) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pending_registrations_nik_unique" UNIQUE("nik"),
	CONSTRAINT "pending_registrations_username_unique" UNIQUE("username"),
	CONSTRAINT "pending_registrations_email_unique" UNIQUE("email")
);
