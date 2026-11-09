-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(64) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'lecturer', 'main_admin', 'student') NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rank` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturers` (
    `user_id` VARCHAR(64) NOT NULL,
    `min_workload` INTEGER NOT NULL DEFAULT 3,
    `max_workload` INTEGER NOT NULL DEFAULT 12,
    `years_experience` INTEGER NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_departments` (
    `lecturer_id` VARCHAR(64) NOT NULL,
    `department` VARCHAR(128) NOT NULL,

    PRIMARY KEY (`lecturer_id`, `department`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_specializations` (
    `lecturer_id` VARCHAR(64) NOT NULL,
    `specialization` VARCHAR(128) NOT NULL,
    `expertise_rating` INTEGER NULL,
    `preference_rating` INTEGER NULL,

    PRIMARY KEY (`lecturer_id`, `specialization`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_availability` (
    `lecturer_id` VARCHAR(64) NOT NULL,
    `monday` BOOLEAN NOT NULL DEFAULT true,
    `tuesday` BOOLEAN NOT NULL DEFAULT true,
    `wednesday` BOOLEAN NOT NULL DEFAULT true,
    `thursday` BOOLEAN NOT NULL DEFAULT true,
    `friday` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`lecturer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `user_id` VARCHAR(64) NOT NULL,
    `matric_number` VARCHAR(64) NULL,
    `department` VARCHAR(128) NULL,
    `level` INTEGER NULL,

    UNIQUE INDEX `students_matric_number_key`(`matric_number`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_courses` (
    `student_id` VARCHAR(64) NOT NULL,
    `course_id` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`student_id`, `course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(64) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `units` INTEGER NOT NULL,
    `required_hours` INTEGER NOT NULL,
    `status` ENUM('C', 'R', 'E') NOT NULL,
    `department` VARCHAR(128) NOT NULL,

    UNIQUE INDEX `courses_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_prerequisites` (
    `course_id` VARCHAR(64) NOT NULL,
    `prerequisite_code` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`course_id`, `prerequisite_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_specializations` (
    `course_id` VARCHAR(64) NOT NULL,
    `specialization` VARCHAR(128) NOT NULL,

    PRIMARY KEY (`course_id`, `specialization`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allocation_settings` (
    `id` VARCHAR(32) NOT NULL DEFAULT 'global',
    `max_lecturer_workload` INTEGER NOT NULL DEFAULT 15,
    `min_lecturer_workload` INTEGER NOT NULL DEFAULT 3,
    `expertise_weight` INTEGER NOT NULL DEFAULT 60,
    `preference_weight` INTEGER NOT NULL DEFAULT 40,
    `allow_overloading` BOOLEAN NOT NULL DEFAULT false,
    `enforce_availability` BOOLEAN NOT NULL DEFAULT true,
    `max_lecturers_per_course` INTEGER NOT NULL DEFAULT 3,
    `max_3unit_courses_per_lecturer` INTEGER NOT NULL DEFAULT 1,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allocations` (
    `id` VARCHAR(64) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `is_modified` BOOLEAN NOT NULL DEFAULT false,
    `modified_date` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignments` (
    `allocation_id` VARCHAR(64) NOT NULL,
    `lecturer_id` VARCHAR(64) NOT NULL,
    `course_id` VARCHAR(64) NOT NULL,
    `hours` INTEGER NOT NULL,

    INDEX `assignments_lecturer_id_idx`(`lecturer_id`),
    INDEX `assignments_course_id_idx`(`course_id`),
    PRIMARY KEY (`allocation_id`, `lecturer_id`, `course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lecturers` ADD CONSTRAINT `lecturers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_departments` ADD CONSTRAINT `lecturer_departments_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_specializations` ADD CONSTRAINT `lecturer_specializations_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_availability` ADD CONSTRAINT `lecturer_availability_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_prerequisites` ADD CONSTRAINT `course_prerequisites_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_specializations` ADD CONSTRAINT `course_specializations_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_allocation_id_fkey` FOREIGN KEY (`allocation_id`) REFERENCES `allocations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
